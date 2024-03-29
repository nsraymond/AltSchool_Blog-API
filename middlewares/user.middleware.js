const joi = require('joi')


async function ValidateUserCreation (req, res, next) {
    try {
        const schema = joi.object({
           first_name: joi.string().required().min(3).messages({
                'string.min': 'First Name must be at least 3 characters long',
                'any.required': 'First Name is required',
            }),
           last_name: joi.string().required().min(3).messages({
                'string.min': ' Last Name must be at least 3 characters long',
                'any.required': 'Last Name is required',
            }),
            password: joi.string().min(6).required().messages({
                'string.min': 'Password must be at least 6 characters long',
                'any.required': 'Password is required',
            }),
            email: joi.string().email().required().messages({
                'string.email': 'Invalid email format',
                'any.required': 'Email is required',
            }),
        })
        await schema.validateAsync(req.body, { abortEarly: true })
        next()
    } catch (error) {
        return res.status(422).json({
            message: error.message,
            success: false
        })
    }
}

async function ValidateUserLogin (req, res, next) {
    try {
        const schema = joi.object({
            password: joi.string().required(),
            email: joi.string().email().required(),
        })
        await schema.validateAsync(req.body, { abortEarly: true })
        next()
    } catch (error) {
        return res.status(422).json({
            message: error.message,
            success: false
        })
    }
}


module.exports = {
    ValidateUserCreation,
    ValidateUserLogin
}
