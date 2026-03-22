const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // 微信小程序用户信息
  openid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  unionid: {
    type: String,
    default: null
  },
  nickname: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  
  // 用户角色和状态
  role: {
    type: String,
    enum: ['creator', 'implementer', 'admin'],
    default: 'creator'
  },
  isPro: {
    type: Boolean,
    default: false
  },
  proExpiry: {
    type: Date,
    default: null
  },
  
  // 联系方式（用于闲鱼交易）
  xianyuLink: {
    type: String,
    default: ''
  },
  wechatId: {
    type: String,
    default: ''
  },
  
  // 统计信息
  totalIdeas: {
    type: Number,
    default: 0
  },
  completedIdeas: {
    type: Number,
    default: 0
  },
  
  // 时间戳
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// 索引优化
userSchema.index({ openid: 1 });
userSchema.index({ role: 1, createdAt: -1 });

module.exports = mongoose.model('User', userSchema);