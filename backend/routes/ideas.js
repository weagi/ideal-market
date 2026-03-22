const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Idea = require('../models/Idea');
const User = require('../models/User');
const { queueIdeaProcessing } = require('../services/taskQueue');

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'voice') {
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('语音文件必须是音频格式'), false);
      }
    } else if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('图片文件必须是图像格式'), false);
      }
    } else {
      cb(null, true);
    }
  }
});

// POST /api/v1/ideas - 提交新灵感（小程序端）
router.post('/', upload.fields([
  { name: 'voice', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), async (req, res) => {
  try {
    const { openid, textContent } = req.body;
    
    // 验证用户
    if (!openid) {
      return res.status(400).json({ error: '缺少用户标识' });
    }
    
    // 查找或创建用户
    let user = await User.findOne({ openid });
    if (!user) {
      user = new User({ openid, nickname: '匿名用户' });
      await user.save();
    }
    
    // 确定输入类型
    let inputType = 'text';
    if (req.files?.voice && req.files?.image) {
      inputType = 'mixed';
    } else if (req.files?.voice) {
      inputType = 'voice';
    } else if (req.files?.image) {
      inputType = 'image';
    }
    
    // 创建灵感记录
    const ideaData = {
      userId: user._id,
      inputType,
      textContent: textContent || '',
      status: 'processing'
    };
    
    if (req.files?.voice) {
      ideaData.voiceFile = `/uploads/${req.files.voice[0].filename}`;
    }
    
    if (req.files?.image) {
      ideaData.imageFile = `/uploads/${req.files.image[0].filename}`;
    }
    
    const idea = new Idea(ideaData);
    await idea.save();
    
    // 更新用户统计
    user.totalIdeas += 1;
    await user.save();
    
    // 推送异步处理任务
    await queueIdeaProcessing(idea._id.toString());
    
    // 返回成功响应（无需等待AI处理完成）
    res.status(201).json({
      success: true,
      message: '灵感已接收，AI正在后台为您整理',
      ideaId: idea._id,
      status: 'processing'
    });
    
  } catch (error) {
    console.error('提交灵感失败:', error);
    res.status(500).json({ 
      error: '提交失败，请稍后重试',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/v1/ideas/:id - 获取灵感详情（小程序端）
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { openid } = req.query;
    
    if (!openid) {
      return res.status(400).json({ error: '缺少用户标识' });
    }
    
    const user = await User.findOne({ openid });
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    const idea = await Idea.findOne({ _id: id, userId: user._id });
    if (!idea) {
      return res.status(404).json({ error: '灵感不存在或无权限访问' });
    }
    
    res.json({ success: true, data: idea });
    
  } catch (error) {
    console.error('获取灵感详情失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

// GET /api/v1/ideas - 获取用户灵感列表（小程序端）
router.get('/', async (req, res) => {
  try {
    const { openid, page = 1, limit = 20 } = req.query;
    
    if (!openid) {
      return res.status(400).json({ error: '缺少用户标识' });
    }
    
    const user = await User.findOne({ openid });
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const ideas = await Idea.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');
    
    const total = await Idea.countDocuments({ userId: user._id });
    
    res.json({
      success: true,
      data: ideas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('获取灵感列表失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

// PUT /api/v1/ideas/:id/xianyu-link - 回填闲鱼链接（小程序端）
router.put('/:id/xianyu-link', async (req, res) => {
  try {
    const { id } = req.params;
    const { openid, xianyuLink } = req.body;
    
    if (!openid || !xianyuLink) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    const user = await User.findOne({ openid });
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    const idea = await Idea.findOne({ _id: id, userId: user._id, status: 'completed' });
    if (!idea) {
      return res.status(404).json({ error: '灵感不存在、未完成或无权限操作' });
    }
    
    // 验证闲鱼链接格式
    if (!/^https?:\/\/.*xianyu\.com\/.*/.test(xianyuLink)) {
      return res.status(400).json({ error: '闲鱼链接格式不正确' });
    }
    
    idea.xianyuLink = xianyuLink;
    idea.isListedOnMarket = true;
    idea.listedAt = new Date();
    idea.marketPrice = extractPriceFromXianyuLink(xianyuLink); // 从链接提取价格
    
    await idea.save();
    
    res.json({
      success: true,
      message: '闲鱼链接已同步，灵感已上架到市场',
      data: idea
    });
    
  } catch (error) {
    console.error('回填闲鱼链接失败:', error);
    res.status(500).json({ error: '操作失败' });
  }
});

// Web端市场接口（只读）
// GET /api/v1/ideas/market - 获取市场列表（Web端）
router.get('/market', async (req, res) => {
  try {
    // Web端不允许提交新灵感，只允许浏览
    const { page = 1, limit = 20, priceMin, priceMax, tags, sortBy = 'createdAt' } = req.query;
    
    const filter = { isListedOnMarket: true, status: 'completed' };
    
    if (priceMin) filter.marketPrice = { ...filter.marketPrice, $gte: parseFloat(priceMin) };
    if (priceMax) filter.marketPrice = { ...filter.marketPrice, $lte: parseFloat(priceMax) };
    if (tags) filter.industryTags = { $in: tags.split(',') };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortBy === 'aiScore' ? -1 : -1; // AI评分降序，其他时间降序
    
    const ideas = await Idea.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('aiGenerated.xianyuTitle aiGenerated.aiScore marketPrice industryTags createdAt xianyuLink')
      .lean();
    
    const total = await Idea.countDocuments(filter);
    
    res.json({
      success: true,
      data: ideas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('获取市场列表失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

// Web端严格限制：禁止发布操作
router.post('/market', (req, res) => {
  res.status(403).json({ error: 'Web端不允许发布灵感，请使用小程序' });
});

router.put('/:id', (req, res) => {
  res.status(403).json({ error: 'Web端不允许修改灵感，请使用小程序' });
});

// 辅助函数：从闲鱼链接提取价格
function extractPriceFromXianyuLink(url) {
  // 这里可以实现更复杂的解析逻辑
  // 目前返回0，实际价格需要用户在小程序中手动设置或从闲鱼API获取
  return 0;
}

module.exports = router;