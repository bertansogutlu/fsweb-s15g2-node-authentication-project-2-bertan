const { JWT_SECRET } = require("../secrets"); // bu secreti kullanın!
const userModel = require("../users/users-model");
const jwt = require('jsonwebtoken');

const sinirli = (req, res, next) => {
  /*
    Eğer Authorization header'ında bir token sağlanmamışsa:
    status: 401
    {
      "message": "Token gereklidir"
    }

    Eğer token doğrulanamıyorsa:
    status: 401
    {
      "message": "Token gecersizdir"
    }

    Alt akıştaki middlewarelar için hayatı kolaylaştırmak için kodu çözülmüş tokeni req nesnesine koyun!
  */
 try {
  token = req.headers.authorization
  if(!token){
    res.status(401).json({ message: "Token gereklidir" });
  } else{
    jwt.verify(token,JWT_SECRET,(error,decodedJWT)=>{
      if(error){
        res.status(401).json({ message: "Token gecersizdir" });
      } else{
        next()
      }
    })
  }
 } catch (error) {
  next(error);
 }
};

const sadece = (role_name) => (req, res, next) => {
  /*
    
	Kullanıcı, Authorization headerında, kendi payloadu içinde bu fonksiyona bağımsız değişken olarak iletilen 
	rol_adı ile eşleşen bir role_name ile bir token sağlamazsa:
    status: 403
    {
      "message": "Bu, senin için değil"
    }

    Tekrar authorize etmekten kaçınmak için kodu çözülmüş tokeni req nesnesinden çekin!
  */
};

const usernameVarmi = async (req, res, next) => {
  /*
    req.body de verilen username veritabanında yoksa
    status: 401
    {
      "message": "Geçersiz kriter"
    }
  */
  try {
    if(!req.body.username){
      res.status(401).json({ message: "Geçersiz kriter" });
    } else{
      const users = await userModel.goreBul({ 'users.username': req.body.username, })
      if (users.length === 0) {
        res.status(401).json({ message: "Geçersiz kriter" });
      } else {
        next()
      }
    }
 } catch (error) {
    next(error);
  }
};

const rolAdiGecerlimi = (req, res, next) => {
  /*
    Bodydeki role_name geçerliyse, req.role_name öğesini trimleyin ve devam edin.

    Req.body'de role_name eksikse veya trimden sonra sadece boş bir string kaldıysa,
    req.role_name öğesini "student" olarak ayarlayın ve isteğin devam etmesine izin verin.

    Stringi trimledikten sonra kalan role_name 'admin' ise:
    status: 422
    {
      "message": "Rol adı admin olamaz"
    }

    Trimden sonra rol adı 32 karakterden fazlaysa:
    status: 422
    {
      "message": "rol adı 32 karakterden fazla olamaz"
    }
  */
 try {
  if(!req.body.role_name || !req.body.role_name.trim()){
    req.body.role_name = "student";
    next();
  } else{
    req.body.role_name = req.body.role_name.trim();
    if(req.body.role_name === "admin"){
      res.status(422).json({ message: "Rol adı admin olamaz" });
    } else if (req.body.role_name.length > 32 ){
      res.status(422).json({ message: "rol adı 32 karakterden fazla olamaz" });
    } else{
      next();
    }
  }
 } catch (error) {
  next(error)
 }
};

module.exports = {
  sinirli,
  usernameVarmi,
  rolAdiGecerlimi,
  sadece,
};
