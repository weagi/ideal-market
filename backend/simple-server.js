const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 安全中间件
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:8082', 'http://localhost:8084', 'http://localhost:8085'],
  credentials: true
}));

// 解析JSON
app.use(express.json());

// 内存存储（生产环境应该使用数据库）
let ideas = [
  {
    id: 1,
    title: '社区团购小程序源码',
    aiScore: 85,
    tags: ['小程序', '电商', '社区'],
    price: 299,
    xianyuLink: '#'
  },
  {
    id: 2,
    title: 'AI智能客服系统',
    aiScore: 92,
    tags: ['AI', '客服', 'SaaS'],
    price: 599,
    xianyuLink: '#'
  }
];

let users = {};

// 基础路由
app.get('/', (req, res) => {
  res.json({ 
    message: '灵感集市后端服务（简化版）',
    version: '1.0.0',
    status: 'running'
  });
});

// 获取市场列表
app.get('/api/v1/ideas/market', (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const paginatedIdeas = ideas.slice(skip, skip + parseInt(limit));
  
  res.json({
    success: true,
    data: paginatedIdeas,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: ideas.length,
      pages: Math.ceil(ideas.length / parseInt(limit))
    }
  });
});

// 提交新灵感
app.post('/api/v1/ideas', (req, res) => {
  const { textContent, openid } = req.body;
  
  // 模拟AI处理
  const newIdea = {
    id: ideas.length + 1,
    title: textContent || '新创意项目',
    aiScore: Math.floor(Math.random() * 20) + 80, // 80-100分
    tags: ['AI生成', '待分类'],
    price: Math.floor(Math.random() * 500) + 100, // 100-600元
    xianyuLink: '#'
  };
  
  ideas.push(newIdea);
  
  // 保存用户信息
  if (openid) {
    if (!users[openid]) {
      users[openid] = { openid, ideas: [] };
    }
    users[openid].ideas.push(newIdea.id);
  }
  
  res.status(201).json({
    success: true,
    message: '灵感已接收，AI正在后台为您整理',
    ideaId: newIdea.id,
    status: 'processing'
  });
});

// 获取用户灵感列表
app.get('/api/v1/ideas', (req, res) => {
  const { openid, page = 1, limit = 20 } = req.query;
  
  if (!openid) {
    return res.status(400).json({ error: '缺少用户标识' });
  }
  
  // 模拟用户数据
  const userIdeas = ideas.filter(idea => 
    users[openid] && users[openid].ideas.includes(idea.id)
  );
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const paginatedIdeas = userIdeas.slice(skip, skip + parseInt(limit));
  
  res.json({
    success: true,
    data: paginatedIdeas,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: userIdeas.length,
      pages: Math.ceil(userIdeas.length / parseInt(limit))
    }
  });
});

// 微信JS-SDK配置（模拟）
app.get('/api/v1/wechat/js-config', (req, res) => {
  res.json({
    success: true,
    config: {
      appId: 'test-app-id',
      timestamp: Date.now(),
      nonceStr: 'test-nonce',
      signature: 'test-signature'
    }
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: '接口未找到' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 灵感集市简化版后端服务启动成功`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
});

module.exports = app;