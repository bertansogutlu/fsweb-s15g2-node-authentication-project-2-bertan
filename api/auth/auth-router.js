const router = require("express").Router();
const { usernameVarmi, rolAdiGecerlimi } = require("./auth-middleware");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../secrets/index"); // bu secret'ı kullanın!
const userModel = require("../users/users-model");

router.post("/register", rolAdiGecerlimi, async (req, res, next) => {
  /**
    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status: 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */
  try {
    const { username, password, role_name } = req.body;
    if(!username || !password || !role_name){
      res.status(401).json({ message: "Geçersiz kriter" });
    } else{
      const newUser = { username, password, role_name };
      newUser.password = bcrypt.hashSync(password, 6);
      const userArr = await userModel.ekle(newUser);
      const user = userArr[0]
      res.status(201).json(user);
    }
  } catch (error) {
    next(error)
  }
});

router.post("/login", usernameVarmi, async (req, res, next) => {
  /**
    [POST] /api/auth/login { "username": "sue", "password": "1234" }

    response:
    status: 200
    {
      "message": "sue geri geldi!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }

    Token 1 gün sonra timeout olmalıdır ve aşağıdaki bilgiyi payloadında içermelidir:

    {
      "subject"  : 1       // giriş yapan kullanıcının user_id'si
      "username" : "bob"   // giriş yapan kullanıcının username'i
      "role_name": "admin" // giriş yapan kulanıcının role adı
    }
   */
  try {
    if (!req.body.password) {
      res.status(401).json({ message: "Geçersiz kriter" });
    } else {
      const users = await userModel.goreBul({
        "users.username": req.body.username,
      });
      const user = users[0];
      const isValid = bcrypt.compareSync(req.body.password, user.password);
      if (isValid) {
        console.log(user);
        const token = generateToken(user);
        res
          .status(200)
          .json({
            subject: user.user_id,
            message: `${user.username} geri geldi!`,
            token: token,
          });
      } else {
        res.status(401).json({ message: "Geçersiz kriter" });
      }
    }
  } catch (error) {
    next(error);
  }
});

function generateToken(user) {
  const payload = {
    subject: user.user_id,
    username: user.username,
    role_name: user.role_name,
  };
  const secret = JWT_SECRET;
  const options = {
    expiresIn: "1h",
  };
  return jwt.sign(payload, secret, options);
}

module.exports = router;
