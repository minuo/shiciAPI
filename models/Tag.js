const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  usageCount: { type: Number, default: 0 },
  createTime: { type: Date, default: Date.now },
  updateTime: { type: Date, default: Date.now }
});

// 简化版本，不使用中间件
// 时间戳将使用默认值

// 添加虚拟属性，建立到Poem的反向引用
tagSchema.virtual('poems', {
  ref: 'Poem',
  localField: '_id',
  foreignField: 'tags'
});

// 确保虚拟属性可以被转换为JSON
tagSchema.set('toObject', { virtuals: true });
tagSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Tag', tagSchema);