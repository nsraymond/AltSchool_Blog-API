const BlogModel = require('../models/blog.model')
const UserModel = require('../models/user.model')
require('dotenv').config()


// Get all published blogs with various filters
async function getAllBlogs(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const author = req.query.author;
    const title = req.query.title;
    const tags = req.query.tags;
    const order = req.query.order || 'timestamp';
    const sortDirection = req.query.sortDirection || 'desc';
    const sortOptions = {};
    sortOptions[order] = sortDirection === 'asc' ? 1 : -1;
    const query = {};
    query.state = 'published';

    if (author) {
      query['author.name'] = author;
    }
    if (title) {
      query.title = new RegExp(title, 'i');
    }
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }
    const blogs = await BlogModel.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);
    if (!blogs || blogs.length === 0) {
      return res.status(404).json({ message: 'No blogs found' });
    }
    return res.status(200).json({ blogs });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Create a new blog
async function createBlog(req, res) {
  try {
    const blogFromReq = req.body;
    const existingBlog = await BlogModel.findOne({ title: blogFromReq.title });
    if (existingBlog) {
      return res.status(409).json({
        success: false,
        message: 'Blog with this title already exists',
      });
    }
    const readingTime = await calculateReadingTime(blogFromReq.body);
    const blog = await BlogModel.create({
      title: blogFromReq.title,
      body: blogFromReq.body,
      description: blogFromReq.description,
      state: blogFromReq.state,
      author: { id: req.user._id, name: req.user.first_name },
      tags: blogFromReq.tags,
      reading_time: readingTime,
    });

    if (blog) {
      return res.status(201).json({
        success: true,
        message: 'Blog created successfully',
        data: { blog },
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create a blog',
    });
  }
}

// Get published blogs
async function getPublishedBlogs(req, res) {
  try {
    const blogs = await BlogModel.find({ state: 'published' });
    if (blogs) {
      return res.status(200).json({
        success: true,
        message: 'Blogs fetched successfully',
        data: { blogs },
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
    });
  }
}

// Update the state of a blog
async function updateBlogState(req, res) {
  const blogId = req.params.id;
  const userId = req.user._id;
  const blog = await BlogModel.findById(blogId);
  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' });
  }

  if (!blog.author || !blog.author.id) {
    return res.status(400).json({ message: 'Invalid blog author information' });
  }
  if (blog.author.id.toString() !== userId) {
    return res.status(403).json({ message: 'You are not the author of this blog' });
  }
  const newState = req.body.state;
  blog.state = newState;
  await blog.save();
  return res.status(200).json({ message: 'Blog state updated successfully' });
}

// Update a blog
async function updateBlog(req, res) {
  const blogId = req.params.id;
  const userId = req.user._id;
  const blog = await BlogModel.findById(blogId);
  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' });
  }
  if (blog.author.id.toString() !== userId) {
    return res.status(403).json({ message: 'You are not the author of this blog' });
  }

  if (req.body.title) {
    blog.title = req.body.title;
  }
  if (req.body.description) {
    blog.description = req.body.description;
  }
  if (req.body.tags) {
    blog.tags = req.body.tags;
  }
  if (req.body.body) {
    blog.body = req.body.body;
  }
  if (req.body.state) {
    blog.state = req.body.state;
  }
  await blog.save();
  return res.status(200).json({ message: 'Blog updated successfully' });
}

// Get blogs by a specific author
async function getBlogsByAuthor(req, res) {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const state = req.query.state;
    const query = {
      'author.id': userId,
    };
    if (state) {
      query.state = state;
    }
    const blogs = await BlogModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    if (!blogs || (blogs.length === 0 && state)) {
      return res.status(404).json({ message: `No ${state} blogs found for the user` });
    }
    if (!blogs || blogs.length === 0) {
      return res.status(404).json({ message: 'No blogs found for the user' });
    }
    return res.status(200).json({ blogs });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// get single blog
async function getSingleBlog(req, res) {
  try {
    const blogId = req.params.id;
    const blog = await BlogModel.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    blog.read_count += 1;
    await blog.save();
    const author = await UserModel.findById(blog.author.id);

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    return res.status(200).json({ blog });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Function to calculate reading time of a blog post
async function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const readingTimeMinutes = wordCount / wordsPerMinute;
  return readingTimeMinutes;
}

// Delete a blog
async function deleteBlog(req, res) {
  const blogId = req.params.id;
  const userId = req.user._id;
  const blog = await BlogModel.findById(blogId);
  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' });
  }
  if (blog.author.id.toString() !== userId) {
    return res.status(403).json({ message: 'You are not the author of this blog' });
  }
  try {
    await BlogModel.findByIdAndDelete(blogId);
    return res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
}


module.exports = {
  getAllBlogs,
  createBlog,
  getPublishedBlogs,
  updateBlogState,
  updateBlog,
  getBlogsByAuthor,
  getSingleBlog,
  deleteBlog,
};
