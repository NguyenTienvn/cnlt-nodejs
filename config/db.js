const mongoose = require('mongoose');

// Cấu hình kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/blog_db');
    console.log('✅ Đã kết nối thành công đến MongoDB');
  } catch (err) {
    console.error('❌ Lỗi kết nối MongoDB:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
