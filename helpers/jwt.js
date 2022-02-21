const expressJwt = require("express-jwt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config()

const authJWT = () => {
  const secret = process.env.SECRET_KEY;
  return expressJwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      // Paths that does not need to be authenticated
      { url: /\/api\/shorty\/redirect(.*)/, methods: ["GET", "OPTIONS"] },
      "/api/users/login",
      "/api/users/register",
      "/api/users/forgetpassword",
      { url: /\/api\/users\/changepassword(.*)/, methods: ["GET", "OPTIONS", "POST"] },
    ],
  });
}

async function isRevoked(req, payload, done) {
  if (payload.isVerified) {
    done(null, true);
  }
  done();
}


module.exports = authJWT;

// const auth = async (req, res, next)=>{
//   try{
//       const token = req.header("Authorization")
//       let checkToken = jwt.verify(token, process.env.SECRET_KEY)
//       console.log(checkToken)
//       next();
//   }catch(err){
//       res.status(401).send({message: "Invalid page"})
//   }
// }

// module.exports = auth