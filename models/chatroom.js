const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// TO DO: define chatroom schema
const blogSchema = new Schema();

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
