const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

// 微信公众号配置
const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APP_ID || 'your-wechat-app-id',
  appSecret: process.env.WECHAT_APP_SECRET || 'your-wechat-app-secret',
  token: process.env.WECHAT_TOKEN || 'your-wechat-token',
  encodingAESKey: process.env.WECHAT_ENCODING_AES_KEY || ''
};

// 微信公众号OAuth2.0授权
router.get('/oauth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: '缺少授权码' });
    }
    
    // 获取access_token和openid
    const tokenResponse = await axios.get(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_CONFIG.appId}&secret=${WECHAT_CONFIG.appSecret}&code=${code}&grant_type=authorization_code`
    );
    
    const { access_token, openid, refresh_token } = tokenResponse.data;
    
    if (!openid) {
      throw new Error('获取openid失败');
    }
    
    // 获取用户信息
    const userInfoResponse = await axios.get(
      `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`
    );
    
    const userInfo = userInfoResponse.data;
    
    // 保存或更新用户信息
    const User = require('../models/User');
    let user = await User.findOne({ openid });
    if (!user) {
      user = new User({
        openid,
        nickname: userInfo.nickname,
        avatar: userInfo.headimgurl,
        unionid: userInfo.unionid || null
      });
    } else {
      user.nickname = userInfo.nickname;
      user.avatar = userInfo.headimgurl;
      if (userInfo.unionid) {
        user.unionid = userInfo.unionid;
      }
    }
    await user.save();
    
    // 生成JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ openid }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '7d' });
    
    // 重定向到前端页面，携带token
    res.redirect(`http://localhost:8083/?token=${token}&openid=${openid}`);
    
  } catch (error) {
    console.error('微信OAuth回调失败:', error);
    res.status(500).json({ error: '授权失败，请重试' });
  }
});

// 获取微信JS-SDK配置
router.get('/js-config', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: '缺少URL参数' });
    }
    
    // 获取access_token
    const tokenResponse = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_CONFIG.appId}&secret=${WECHAT_CONFIG.appSecret}`
    );
    
    const { access_token } = tokenResponse.data;
    
    // 获取jsapi_ticket
    const ticketResponse = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`
    );
    
    const { ticket } = ticketResponse.data;
    
    // 生成签名
    const crypto = require('crypto');
    const nonceStr = Math.random().toString(36).substr(2, 15);
    const timestamp = parseInt(Date.now() / 1000);
    
    const string1 = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
    const signature = crypto.createHash('sha1').update(string1).digest('hex');
    
    res.json({
      success: true,
      config: {
        appId: WECHAT_CONFIG.appId,
        timestamp,
        nonceStr,
        signature
      }
    });
    
  } catch (error) {
    console.error('获取JS-SDK配置失败:', error);
    res.status(500).json({ error: '获取配置失败' });
  }
});

// 微信公众号消息接收（用于验证服务器）
router.get('/', (req, res) => {
  const { signature, timestamp, nonce, echostr } = req.query;
  
  // 验证签名
  const crypto = require('crypto');
  const arr = [WECHAT_CONFIG.token, timestamp, nonce].sort();
  const str = arr.join('');
  const sha1 = crypto.createHash('sha1').update(str).digest('hex');
  
  if (sha1 === signature) {
    res.send(echostr);
  } else {
    res.status(403).send('Forbidden');
  }
});

// 微信公众号消息接收（POST）
router.post('/', (req, res) => {
  // 处理微信公众号消息
  // 这里可以实现自动回复等功能
  res.send('success');
});

module.exports = router;