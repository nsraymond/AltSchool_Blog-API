// importing packages
const express = require('express')
require('dotenv').config()

// importing modules
const db = require('./config/db')
const blogRouter = require('./routes/blog.route')
const userRouter = require('./routes/user.route')


// instantiating express
const app = express()

// port
const PORT = process.env.PORT;

// connecting to mongodb
db.connectToMongoDB()

// middlewares
app.use(express.json())

// routing
app.use('/blogs', blogRouter)
app.use('/', userRouter)


app.get('*', (req, res) => {
    res.send('page not found')
})


// server
app.listen(PORT, () => {
    console.log(`server is running on port:${PORT}`)
})