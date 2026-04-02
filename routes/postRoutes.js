const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const postController = require('../controllers/postController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// Route hiển thị danh sách bài viết
router.get('/', postController.index);

// Route hiển thị form thêm bài viết
router.get('/post/create', postController.create);

// Route lưu bài viết mới
router.post('/post/store', upload.single('image'), postController.store);

// Route hiển thị chi tiết bài viết
router.get('/post/:id', postController.show);

// Route hiển thị form sửa bài viết
router.get('/post/:id/edit', postController.edit);

// Route cập nhật bài viết
router.post('/post/:id/update', upload.single('image'), postController.update);

// Route xóa bài viết
router.post('/post/:id/delete', postController.destroy);

module.exports = router;
