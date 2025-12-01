const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
  description: { type: String }, // 详细介绍
  shortDescription: { type: String }, // 简短介绍
  dynasty: { type: String, index: true }, // 朝代
  birthYear: String, // 出生年份（可能不完整，使用String更灵活）
  deathYear: String, // 去世年份
  worksCount: { type: Number, default: 0 }, // 作品数量
  originalId: { type: String }, // 原始数据ID，用于追踪
  createTime: { type: Date, default: Date.now },
  updateTime: { type: Date, default: Date.now }
});

// 添加虚拟属性，建立到Poem的反向引用
authorSchema.virtual('poems', {
  ref: 'Poem',
  localField: '_id',
  foreignField: 'authorId' // 这里需要在Poem模型中添加authorId字段
});

// 确保虚拟属性可以被转换为JSON
authorSchema.set('toObject', { virtuals: true });
authorSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Author', authorSchema);