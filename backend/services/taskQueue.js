const { createClient } = require('redis');
require('dotenv').config();

// Redis客户端（用于任务状态跟踪）
let redisClient;

// 初始化Redis连接
async function initRedis() {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    await redisClient.connect();
    console.log('✅ Redis连接成功');
  } catch (error) {
    console.error('❌ Redis连接失败:', error);
    throw error;
  }
}

// 推送灵感处理任务到队列（简化版，使用Redis列表模拟队列）
async function queueIdeaProcessing(ideaId, priority = 5) {
  if (!redisClient) {
    throw new Error('Redis未初始化');
  }
  
  const task = {
    ideaId,
    timestamp: Date.now(),
    attempts: 0,
    priority
  };
  
  // 使用Redis列表模拟优先级队列
  await redisClient.lPush('idea_processing_queue', JSON.stringify(task));
  
  // 在Redis中记录任务状态
  await redisClient.setex(`task:${ideaId}`, 3600, 'queued'); // 1小时过期
  
  console.log(`📤 任务已入队: ${ideaId}`);
  return true;
}

// AI处理工作者（简化版）
async function startAIWorker() {
  if (!redisClient) {
    await initRedis();
  }
  
  console.log('🤖 AI处理工作者启动，等待任务...');
  
  // 模拟任务处理循环
  setInterval(async () => {
    try {
      // 从队列中获取任务
      const taskData = await redisClient.rPop('idea_processing_queue');
      if (taskData) {
        const task = JSON.parse(taskData);
        console.log(`🔧 开始处理灵感任务: ${task.ideaId}`);
        
        // 更新Redis状态
        await redisClient.setex(`task:${task.ideaId}`, 3600, 'processing');
        
        // 执行AI处理（模拟异步处理）
        setTimeout(async () => {
          try {
            await processIdeaWithAI(task.ideaId);
            console.log(`✅ 灵感任务处理完成: ${task.ideaId}`);
          } catch (error) {
            console.error(`❌ 灵感任务处理失败: ${task.ideaId}`, error);
            await markIdeaAsFailed(task.ideaId, error.message);
          }
        }, 2000); // 模拟2秒处理时间
        
      }
    } catch (error) {
      console.error('任务处理循环错误:', error);
    }
  }, 1000);
}

// AI处理核心逻辑
async function processIdeaWithAI(ideaId) {
  const Idea = require('../models/Idea');
  const { transcribeAudio, analyzeImage, generatePRD } = require('./aiServices');
  
  const idea = await Idea.findById(ideaId);
  if (!idea) {
    throw new Error('灵感不存在');
  }
  
  let combinedContent = idea.textContent || '';
  
  // 语音转文字
  if (idea.voiceFile) {
    const audioText = await transcribeAudio(idea.voiceFile);
    combinedContent += '\n' + audioText;
  }
  
  // 图片OCR识别
  if (idea.imageFile) {
    const imageText = await analyzeImage(idea.imageFile);
    combinedContent += '\n' + imageText;
  }
  
  // 内容风控检查
  if (await require('./aiServices').isContentViolating(combinedContent)) {
    throw new Error('内容包含违禁信息');
  }
  
  // 生成PRD和闲鱼文案
  const aiResult = await generatePRD(combinedContent, idea.inputType);
  
  // 更新数据库
  idea.aiGenerated = {
    xianyuTitle: aiResult.xianyuTitle,
    xianyuDescription: aiResult.xianyuDescription,
    internalPRD: aiResult.internalPRD,
    aiScore: aiResult.aiScore,
    estimatedCost: aiResult.estimatedCost,
    estimatedTime: aiResult.estimatedTime,
    industryTags: aiResult.industryTags
  };
  idea.status = 'completed';
  idea.completedAt = new Date();
  await idea.save();
  
  // 触发微信通知（模拟）
  console.log(`📱 发送微信通知给用户: 灵感 "${aiResult.xianyuTitle}" 已整理完毕`);
}

// 标记灵感处理失败
async function markIdeaAsFailed(ideaId, errorMessage) {
  const Idea = require('../models/Idea');
  await Idea.findByIdAndUpdate(ideaId, {
    status: 'failed',
    errorMessage: errorMessage || '处理失败'
  });
}

// 初始化所有服务
async function initServices() {
  await initRedis();
}

module.exports = {
  initServices,
  queueIdeaProcessing,
  startAIWorker
};