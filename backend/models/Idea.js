const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
  // 关联用户
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // 原始输入数据
  inputType: {
    type: String,
    enum: ['voice', 'image', 'text', 'mixed'],
    required: true
  },
  voiceFile: {
    type: String, // 文件路径或URL
    default: null
  },
  imageFile: {
    type: String, // 文件路径或URL
    default: null
  },
  textContent: {
    type: String,
    default: ''
  },
  
  // 处理状态
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed', 'exception'],
    default: 'processing',
    index: true
  },
  processingAttempts: {
    type: Number,
    default: 0
  },
  errorMessage: {
    type: String,
    default: ''
  },
  
  // AI生成内容
  aiGenerated: {
    xianyuTitle: {
      type: String,
      default: ''
    },
    xianyuDescription: {
      type: String,
      default: ''
    },
    internalPRD: {
      type: String,
      default: ''
    },
    aiScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    estimatedCost: {
      type: Number, // 预估开发成本（元）
      default: 0
    },
    estimatedTime: {
      type: String, // 预估开发时间
      default: ''
    }
  },
  
  // 闲鱼链接和市场信息
  xianyuLink: {
    type: String,
    default: '',
    validate: {
      validator: function(v) {
        return v === '' || /^https?:\/\//.test(v);
      },
      message: '闲鱼链接必须是有效的URL'
    }
  },
  isListedOnMarket: {
    type: Boolean,
    default: false,
    index: true
  },
  marketPrice: {
    type: Number,
    default: 0
  },
  industryTags: {
    type: [String],
    default: []
  },
  
  // 时间戳
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  listedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// 索引优化
ideaSchema.index({ userId: 1, createdAt: -1 });
ideaSchema.index({ status: 1, createdAt: 1 });
ideaSchema.index({ isListedOnMarket: 1, createdAt: -1 });
ideaSchema.index({ aiScore: -1 });

module.exports = mongoose.model('Idea', ideaSchema);