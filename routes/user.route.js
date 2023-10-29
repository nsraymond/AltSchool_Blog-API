const express = require('express');
const middleware = require('../middlewares/user.middleware');
const controller = require('../controllers/user.controller');

const userRouter = express.Router();

// signup
userRouter.post('/signup', middleware.ValidateUserCreation, controller.CreateUser);

// login
userRouter.post('/login', middleware.ValidateUserLogin, controller.LoginUser);

module.exports = userRouter;



