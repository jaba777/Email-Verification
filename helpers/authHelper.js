const  bcrypt = require('bcrypt');

 const hashPassword= async (password)=>{

    try {
        const saltRounds=10;
        const hashPassword = await bcrypt.hash(password,saltRounds);
        return hashPassword
    } catch (error) {
        console.log(error);
    }

}

 const comparePassword= async (password,hashedPassword)=>{
   return bcrypt.compare(password,hashedPassword);
}

const generateOTP= async () => {
  try {
    return (otp= `${Math.floor(Math.random() * 999999)}`);
  } catch (error) {
    throw error
  }
}

module.exports={hashPassword, comparePassword, generateOTP}