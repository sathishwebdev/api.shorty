const User = require("../model/userModel");
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')


const VTGenerator = async (data)=>{    
  const saltedKey = await bcrypt.genSalt(10)
  const hashedKey = await bcrypt.hash(`${data.email}${data.name}${data.password}${process.env.VT_SECRET_KEY}`, saltedKey)
  return hashedKey
}

// send mail

const sendEmail = (mail, detail, cb)=>{
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user : process.env.MAIL,
        pass: process.env.MAIL_KEY,
        secure : true
    }
})

let details = {
    from : process.env.MAIL,
    to: mail,
    subject : detail.subject,
    html : detail.message
}

 transporter.sendMail(details, cb)
}


// Register User
exports.registerUser = async (req, res) => {
  try {
    const data = req.body;

    // create user
    let user = new User({
      name: data.name,
      email: data.email,
      linkCount : 0
    });
    // Set password
    user.set_passwordHash(data.password);
    user.VT_KEY = await VTGenerator(data);
    // return user
    user = await user.save();
    if (!user) {res.status(404).send({ detail: "Error to create USER" });
  }else{
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth:{
          user : process.env.MAIL,
          pass: process.env.MAIL_KEY,
          secure : true
      }
  })

  let details = {
      from : process.env.MAIL,
      to: user.email,
      subject : "Verify Account | Shorty",
      html : `<div class="text-center">
          <h1>Verify Your Account</h1><small>${user.name}</small><br/><p>test mail</p><a class="btn btn-primary" href="https://shorty-sk.netlify.app/${user.id}/verify/k/?key=${user.VT_KEY}" target='_blank' >Click here to verify your account</a>
      </div>` 
  }

   transporter.sendMail(details, async (err)=>{
      if(err) {
          res.status(400).send({result:false, message: err.message, mail: false})
      }
      else {           
          res.status(200).send({result : true,message:`Request send to ${user.email}`, mail: true, data: user})
          }
 })
  }
    
  } catch (error) {
    res.status(404).send({ detail: error.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Find A user with provided email
  const user = await User.findOne({ email: email });
  // Check if user exist
  if (!user) return res.status(404).send({ detail: "User not found" });
  // Check if Password is correct
  if (user.checkPassword(password)) {
    // Generate User Token
    const token = user.generateJWT();
    // Return User and token Response
    return res.status(200).send({ user: user.toAuthJson(), token });
  }
  // Send Error Login Message
  res.status(400).send({ detail: "Incorrect Password" });
};

// Get User List
// exports.getUserList = async (req, res) => {
//   try {
//     // Get List
//     const usersList = await User.find({});
//     // Resturn Response
//     if (!usersList) res.status(400).send({ detail: "Error to get User List" });
//     res.send(usersList);
//   } catch (error) {
//     res.status(400).send({ detail: error });
//   }
// };

// Delete Selected Users


exports.deleteUser = async (req, res) => {
  try {
    // Get Users from request
    const { users } = req.body;
    // Delete Users
    await users.map(async (user) => {
      await User.findByIdAndRemove(user.id);
    });
    // Resturn Response
    res.send({message:"Users Deleted Successfully", result: true, error: null});
  } catch (error) {
    res.status(400).send({ detail: error , result: false});
  }
};


// Verfiy Account

exports.verifyUser = async (req, res) =>{
  try{
    const key = req.query.key
    const userId = req.params.id

    const user = await User.findById(userId)

    if(!user){
      res.status(400).send({result: false, message:"invalid key or user", error: true})
    }else if(!user.isVerified){
      if(user.VT_KEY === key){
       await User.findByIdAndUpdate(userId, {isVerified : true, VT_KEY : null})

       res.send({result: true, message: "Account Verified Successfully", data: { user: user.toAuthJson(), token }})
      }else{
        res.status(400).send({result: false, message:"invalid key or user", error: true})
      }
    }else{
      res.send({result: false, message:"Already verified Account", error: true, eCode : "AVA"})
    }

  }catch(error){
    res.status(400).send({ detail: error , error: true});
  }
}

//  forgetPassword  Request

exports.forgetPassword = async(req, res) =>{
  try{
    const {email} = req.body
    const user = await User.findOne({ email: email });

    if(!user){
      res.status(401).send({message: "Invalid user 💔", result: false})
    }else if(user){
      let FPTKey = await fPTokenGenerator(user)
      await User.findByIdAndUpdate(user._id, {FPToken : FPTKey})

      let mailInfo = {
        subject : "Change Your Password | SHORTY",
        message : `<div class="text-center">
        <h1>Change Your Password</h1><small>${user.name}</small><br/><p>test mail</p><a class="btn btn-primary" href="https://shorty-sk.netlify.app/${user._id}/changepassword/k/?key=${FPTKey}" target='_blank' >Click here to change Password</a>
    </div>`
      }

      sendEmail(user.email, mailInfo, async (err)=>{
        if(err) {
            res.status(400).send({result:false, message: err.message, mail: false})
        }
        else {           
            res.status(200).send({result : true,message:`Request send to ${user.email}`, mail: true})
            }
   } )
    }

  }catch(error){
    res.status(400).send({ detail: error , result: false});
  }
}

// fPToken Generator

const fPTokenGenerator = async (data)=>{    
  const saltedKey = await bcrypt.genSalt(10)
  const hashedKey = await bcrypt.hash(`${data.email}${data.name}${data.passwordHash}${process.env.SECRET_FPT_KEY}`, saltedKey)
  return hashedKey
}

//  change Password

exports.changePassword = async (req, res) => {
  try{let key = req.query.key
  let userId = req.params.userId
  let {password} = req.body
  let user = await User.findById(userId)

  const save = async () =>{
  await User.findByIdAndUpdate(userId, {FPToken: null, passwordHash : bcrypt.hashSync(password, 10)})
    
  }

  !user
    ? res.status(400).send({result: false, error : true , message:"invalid request" })
    : user.FPToken === key 
      ? await save() 
      : res.status(400).send({result: false, error:true, message:"Invalid request"})

  res.send({result: true, message: "Successfully password Changed!", error: null})
}catch(error){
  res.status(400).send({ detail: error , result: false});
}

}