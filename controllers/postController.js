const BlogPost = require('../models/BlogPost');
const fs = require('fs');
const path = require('path');

// Hiển thị danh sách bài viết
exports.index = async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    const message = req.query.message || null;
    res.render('index', { posts, message });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách bài viết:', err);
    res.status(500).send('Lỗi server: ' + err.message);
  }
};

// Hiển thị form thêm bài viết
exports.create = (req, res) => {
  res.render('create');
};

// Lưu bài viết mới
exports.store = async (req, res) => {
  try {
    console.log('=== DEBUG INFO ===');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    if (!req.body.title || !req.body.content || !req.body.author) {
      return res.status(400).send('Thiếu thông tin bắt buộc');
    }
    
    const postData = {
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      image: req.file ? '/uploads/' + req.file.filename : null
    };
    
    console.log('Post Data:', postData);
    
    const newPost = await BlogPost.create(postData);
    console.log('Created post:', newPost);
    
    res.redirect('/?message=created');
  } catch (err) {
    console.error('=== ERROR ===');
    console.error('Lỗi khi tạo bài viết:', err);
    console.error('Stack:', err.stack);
    res.status(500).send('Lỗi server: ' + err.message);
  }
};

// Hiển thị chi tiết bài viết
exports.show = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Không tìm thấy bài viết');
    }
    const message = req.query.message || null;
    res.render('detail', { post, message });
  } catch (err) {
    console.error('Lỗi khi lấy bài viết:', err);
    res.status(500).send('Lỗi server: ' + err.message);
  }
};

// Hiển thị form sửa bài viết
exports.edit = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Không tìm thấy bài viết');
    }
    res.render('edit', { post });
  } catch (err) {
    console.error('Lỗi khi lấy bài viết:', err);
    res.status(500).send('Lỗi server: ' + err.message);
  }
};

// Cập nhật bài viết
exports.update = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Không tìm thấy bài viết');
    }

    const postData = {
      title: req.body.title,
      content: req.body.content,
      author: req.body.author
    };

    // Nếu có upload ảnh mới
    if (req.file) {
      // Xóa ảnh cũ nếu có
      if (post.image) {
        const oldImagePath = path.join(__dirname, '..', 'public', post.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      postData.image = '/uploads/' + req.file.filename;
    }
    
    await BlogPost.findByIdAndUpdate(req.params.id, postData);
    res.redirect('/post/' + req.params.id + '?message=updated');
  } catch (err) {
    console.error('Lỗi khi cập nhật bài viết:', err);
    res.status(500).send('Lỗi server: ' + err.message);
  }
};

// Xóa bài viết
exports.destroy = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Không tìm thấy bài viết');
    }

    // Xóa ảnh nếu có
    if (post.image) {
      const imagePath = path.join(__dirname, '..', 'public', post.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await BlogPost.findByIdAndDelete(req.params.id);
    res.redirect('/?message=deleted');
  } catch (err) {
    console.error('Lỗi khi xóa bài viết:', err);
    res.status(500).send('Lỗi server: ' + err.message);
  }
};
