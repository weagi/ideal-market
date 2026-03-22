const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/v1/users/login - 微信小程序登录
router.post('/login', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: '缺少code参数' });
    }
    
    // 这里应该调用微信API获取openid
    // 由于需要真实的微信AppID和Secret，这里模拟返回
    // 在生产环境中需要替换为真实的微信API调用
    
    const mockOpenid = `mock_openid_${Date.now()}`;
    
    // 查找或创建用户
    let user = await User.findOne({ openid: mockOpenid });
    if (!user) {
      user = new User({ 
        openid: mockOpenid, 
        nickname: '测试用户',
        avatar: 'https://example.com/avatar.png'
      });
      await user.save();
    }
    
    res.json({
      success: true,
      openid: mockOpenid,
      userInfo: {
        nickname: user.nickname,
        avatar: user.avatar
      }
    });
    
  } catch (error) {
    console.error('微信登录失败:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// GET /api/v1/users/profile - 获取用户信息
router.get('/profile', async (req, res) => {
  try {
    const { openid } = req.query;
    
    if (!openid) {
      return res.status(400).json({ error: '缺少用户标识' });
    }
    
    const user = await User.findOne({ openid });
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json({
      success: true,
      data: {
        nickname: user.nickname,
        avatar: user.avatar,
        isPro: user.isPro,
        totalIdeas: user.totalIdeas,
        completedIdeas: user.completedIdeas
      }
    });
    
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

module.exports = router;