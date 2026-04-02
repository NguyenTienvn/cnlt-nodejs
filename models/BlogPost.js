const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: null
  }
}, {
  timestamps: true 
});

const BlogPost = mongoose.model('Post', postSchema);
module.exports = BlogPost;
