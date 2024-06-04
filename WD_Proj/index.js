var createError = require('http-errors'); // 404 error handler for express app 
var express = require('express');// Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
const mongoose = require('mongoose'); // Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment. Mongoose supports both promises and callbacks.
const cors = require("cors")

var app = express(); // Create an express app

app.use(express.json()); // Parse incoming request bodies in a middleware before your handlers, available under the req.body property. 
app.use(express.urlencoded({ extended: false })); // Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
app.use(cors());
// Connect to MongoDB

(async () => {
    try {
        await mongoose.connect("mongodb+srv://alikhurram360:3Td5MAJ-jFhm_.D@cluster0.ubqhk0g.mongodb.net/TAAMS")
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})() 
// Routes 

const router = require('./routes/index');// Import routes from routes/index.js
app.use('/', router); // Use the routes from routes/index.js 

app.use(function(req, res, next) { // catch 404 and forward to error handler
    next(createError(404)); 
});

const PORT = 5600;
app.listen(PORT, console.log(`Server running port ${PORT}`)); // Start the server on port 5600

// function paginatedResults(model) {
//     return async (req, res, next) => {
//       const page = parseInt(req.query.page)
//       const limit = parseInt(req.query.limit)
  
//       const startIndex = (page - 1) * limit
//       const endIndex = page * limit
  
//       const results = {}
  
//       if (endIndex < await model.countDocuments().exec()) {
//         results.next = {
//           page: page + 1,
//           limit: limit
//         }
//       }
      
//       if (startIndex > 0) {
//         results.previous = {
//           page: page - 1,
//           limit: limit
//         }
//       }
//       try {
//         results.results = await model.find().limit(limit).skip(startIndex).exec()
//         res.paginatedResults = results
//         next()
//       } catch (e) {
//         res.status(500).json({ message: e.message })
//       }
//     }
//   }