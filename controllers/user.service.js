const UserSchema = require('../models/user.model')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// user login
async function Login ({email, password}){
        const userFromReq = {email, password}
        const user = await UserSchema.findOne({ email: userFromReq.email })
        if (!user){
            return {
                message: 'User not found',
                success: false
            }
        }
        const validPassword = await user.validatePassword(userFromReq.password)
        if (!validPassword){
            return{
                message: 'Invalid password or email',
                success: false
            }
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })
        return {
            message: 'User logged in successfully',
            success: true,
            data: { user, token }
        }
    }
  
// user sign up
async function Signup ({name,email,password,}){
    const userFromReq = {name,email,password,}
        const existingUser = await UserSchema.findOne({ email: userFromReq.email })
        if (existingUser) {
            return {
                message: 'User already exists',
                success: false,
            }
        }
        const user = await UserSchema.create({
            name: userFromReq.name,
            email: userFromReq.email,
            contact: userFromReq.contact,
            password: userFromReq.password,
            phone_number: userFromReq.phone_number,
            gender: userFromReq.gender
        })
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })
                if (user) {
                    return {
                        message: 'User Created successfully',
                        success: true,
                        data: { user, token }
                    }
                }
        };

module.exports = {
    Login,
    Signup
}
