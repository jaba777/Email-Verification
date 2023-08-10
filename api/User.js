const express = require("express");
const router = express.Router();
const user = require("../models/User");
const userOPTVErification = require('../models/OtpScheme');
// const nodemailer = require("nodemailer");
const {hashPassword,generateOTP,comparePassword} = require('../helpers/authHelper.js');
const sendEmail= require('../config/sendEmail.js')
const dotenv = require('dotenv');

dotenv.config()

router.post("/signup", async (req, res) => {



  try {
    let { name, email, password } = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();

    if (name == "" || email == "" || password == "") {
      return res.send({ message: "Name is empty input field" });
    } else if (!/^[a-zA-Z ]*$/.test(name)) {
      return res.send({ message: "invalid name" });
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      return res.send({ message: "invalid email" });
    }
    const findUser = await user.findOne({ email,verified: true });

    if (findUser) {
      return res.send({
        success: false,
        message: "Already register please login",
      });
    } else{
      await user.deleteMany({email})
    }

     const hashPass= await hashPassword(password);
    
     const Users = await new user({name,email,password: hashPass, isVerified: false}).save();

    await sendVerificationEmail(Users,res)

   

  } catch (error) {
    console.log(error);
  }
});

const sendVerificationEmail= async ({_id,email},res)=>{

  try {

    const generatedOTP = await generateOTP();

    const mailOptions = {
      from: 'tskhovreba888@hotmail.com',
      to: email,
      subject: "Verify your Email", 
      html: `<p>Enter  ${generatedOTP} in the app to verify your email address and complete the situation</p>`,
    }

    const hashOPT= await hashPassword(generatedOTP);

    new userOPTVErification({
      userId: _id,
      otp: hashOPT,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    }).save()

    await sendEmail(mailOptions)

    res.status(201).send({
      status: "pending",
      message: "verification otp email sent",
      data: {
        userId: _id,
        email
      }
    })
    
  } catch (error) {
    res.json({
      status: "failed",
      message: error.message,
    })
  }

}



router.post('/verifyOPT', async (req,res)=>{
  try {
    let {userId, otp} = req.body;

    if(!userId || !otp){
      throw Error("Empty opt details are not allowed")
    } else{
      const findUserVerificationOTP= await userOPTVErification.find({userId});
      if(findUserVerificationOTP.length<=0){
        throw Error("Account record doesn't exist or has been verified already")
      } else{
        const {expiresAt} = findUserVerificationOTP[0];
        const hashedOtp=findUserVerificationOTP[0].otp;
        if(expiresAt< Date.now()){
          await userOPTVErification.deleteMany({userId});
          throw new Error("Code has expired. Please request again")
        } else{
          const compareOTP= await comparePassword(otp,hashedOtp);
          if(!compareOTP){
            throw new Error("Invalid code passed. Check your inbox")
          } else{
            await user.updateOne({_id: userId},{verified: true})
            await userOPTVErification.deleteMany({userId});
            res.status(201).send({
              status: "VERIFIED",
              message: "User email verified Successfully",
            })
          }
        }
      }
    }

  } catch (error) {
    res.status(400).send({
      status: "FAILED",
      message: "User Nod Verify successfully",
      error: error.message
    })
  }
})

router.post("/signin", (req, res) => {});

module.exports = router;
