const amqp = require('amqplib');
const redis = require('redis');
require('dotenv').config();

// RabbitMQ连接
let rabbitChannel;
let rabbitConnection;

// Redis客户端（用于任务状态跟踪）
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// 初始化RabbitMQ连接
async function initRabbitMQ() {
  try {
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
    rabbitConnection = await amqp.connect(rabbitUrl);
    rabbitChannel = await rabbitConnection.createChannel();
    
    // 声明队列
    await rabbitChannel.assertQueue('idea_processing_queue', {
      durable: true,
      maxPriority: 10
    });
    
    console.log('✅ RabbitMQ连接成功');
  } catch (error) {
    console.error('❌ RabbitMQ连接失败:', error);
    throw error;
  }
}

// 初始化Redis连接
async function initRedis() {
  try {
    await redisClient.connect();
    console.log('✅ Redis连接成功');
  } catch (error) {
    console.error('❌ Redis连接失败:', error);
    throw error;
  }
}

// 推送灵感处理任务到队列
async function queueIdeaProcessing(ideaId, priority = 5) {
  if (!rabbitChannel) {
    throw new Error('RabbitMQ未初始化');
  }
  
  const task = {
    ideaId,
    timestamp: Date.now(),
    attempts: 0
  };
  
  const success = rabbitChannel.sendToQueue(
    'idea_processing_queue',
    Buffer.from(JSON.stringify(task)),
    { priority }
  );
  
  if (!success) {
    console.warn('⚠️ RabbitMQ队列已满，任务可能丢失');
  }
  
  // 在Redis中记录任务状态
  await redisClient.setex(`task:${ideaId}`, 3600, 'queued'); // 1小时过期
  
  return success;
}

// AI处理工作者（在单独的进程中运行）
async function startAIWorker() {
  if (!rabbitChannel) {
    await initRabbitMQ();
  }
  
  console.log('🤖 AI处理工作者启动，等待任务...');
  
  rabbitChannel.consume('idea_processing_queue', async (msg) => {
    if (msg !== null) {
      try {
        const task = JSON.parse(msg.content.toString());
        console.log(`🔧 开始处理灵感任务: ${task.ideaId}`);
        
        // 更新Redis状态
        await redisClient.setex(`task:${task.ideaId}`, 3600, 'processing');
        
        // 执行AI处理
        await processIdeaWithAI(task.ideaId);
        
        // 确认消息处理完成
        rabbitChannel.ack(msg);
        console.log(`✅ 灵感任务处理完成: ${task.ideaId}`);
        
      } catch (error) {
        console.error(`❌ 灵感任务处理失败: ${task.ideaId}`, error);
        
        // 处理失败，根据重试次数决定是否重新入队
        task.attempts = (task.attempts || 0) + 1;
        if (task.attempts < 3) {
          // 重新入队，降低优先级
          rabbitChannel.sendToQueue(
            'idea_processing_queue',
            Buffer.from(JSON.stringify(task)),
            { priority: Math.max(1, 5 - task.attempts) }
          );
          console.log(`🔄 任务重试 (${task.attempts}/3): ${task.ideaId}`);
        } else {
          // 标记为失败
          await markIdeaAsFailed(task.ideaId, error.message);
        }
        
        rabbitChannel.ack(msg);
      }
    }
  });
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
  if (await isContentViolating(combinedContent)) {
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
  
  // 触发微信通知
  await notifyUserCompletion(idea.userId.toString(), idea._id.toString(), aiResult.xianyuTitle);
}

// 标记灵感处理失败
async function markIdeaAsFailed(ideaId, errorMessage) {
  const Idea = require('../models/Idea');
  await Idea.findByIdAndUpdate(ideaId, {
    status: 'failed',
    errorMessage: errorMessage || '处理失败'
  });
}

// 内容风控检查
async function isContentViolating(content) {
  // 这里可以集成敏感词过滤、AI内容安全检测等
  const sensitiveWords = ['违法', '色情', '暴力', '赌博']; // 示例敏感词
  return sensitiveWords.some(word => content.includes(word));
}

// 微信通知服务
async function notifyUserCompletion(userId, ideaId, title) {
  // 这里集成微信服务通知API
  console.log(`📱 发送微信通知给用户 ${userId}: 灵感 "${title}" 已整理完毕`);
  // 实际实现需要调用微信API
}

// 初始化所有服务
async function initServices() {
  await initRedis();
  await initRabbitMQ();
}

module.exports = {
  initServices,
  queueIdeaProcessing,
  startAIWorker
};