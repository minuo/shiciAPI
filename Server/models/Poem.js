const mongoose = require('mongoose');

const poemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true, index: true }, // 保留字符串作者名，方便查询
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', index: true }, // 添加作者引用
  dynasty: { type: String, required: true, index: true },
  content: { type: [String], required: true },
  annotation: { type: [String] },
  translation: String,
  appreciation: String,
  // 将字符串数组改为引用Tag模型的ObjectId数组
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag', index: true }],
  originalTags: { type: [String] }, // 保留原始标签字符串，方便数据迁移
  likeCount: { type: Number, default: 0 },
  originalId: { type: String }, // 原始数据ID，用于追踪
  createTime: { type: Date, default: Date.now },
  updateTime: { type: Date, default: Date.now }
});

// 简化版本，不使用中间件
// 时间戳将使用默认值

// 定义虚拟属性，用于在查询时填充标签信息
poemSchema.virtual('tagDetails', {
  ref: 'Tag',
  localField: 'tags',
  foreignField: '_id'
});

// 确保虚拟属性可以被转换为JSON
poemSchema.set('toObject', { virtuals: true });
poemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Poem', poemSchema);