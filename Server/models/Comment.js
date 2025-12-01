const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  poemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poem', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createTime: { type: Date, default: Date.now },
  updateTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);