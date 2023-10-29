const express = require('express')
const blogRouter = express.Router()
const controller = require('../controllers/blog.controller')
const authenticateUserToken = require('../middlewares/authenticateUserToken.middleware')
const blogMiddleware = require('../middlewares/blog.middleware')


//all blogs
blogRouter.get('/', controller.getAllBlogs)

// create blog
blogRouter.post('/', authenticateUserToken.BearerTokenAuth, blogMiddleware.BlogCreationValidation, controller.createBlog)

// blogs by author
blogRouter.get('/author', authenticateUserToken.BearerTokenAuth, controller.getBlogsByAuthor)

// blog by id
blogRouter.get('/:id', controller.getSingleBlog)

// update blog state
blogRouter.put('/:id/state',authenticateUserToken.BearerTokenAuth, controller.updateBlogState)

// update blog
blogRouter.patch('/:id/edit', authenticateUserToken.BearerTokenAuth, blogMiddleware.BlogUpdateValidation, controller.updateBlog)

// delete blog
blogRouter.delete('/:id/delete', authenticateUserToken.BearerTokenAuth, controller.deleteBlog)


module.exports = blogRouter;
