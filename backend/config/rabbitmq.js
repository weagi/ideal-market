// RabbitMQ配置
const amqp = require('amqplib');
require('dotenv').config();

class RabbitMQConnection {
  constructor() {
    this.connection = null;
    this.channel = null;
  }
  
  async connect() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      this.channel = await this.connection.createChannel();
      
      // 声明队列
      await this.channel.assertQueue('idea_processing_queue', {
        durable: true,
        maxPriority: 10
      });
      
      console.log('✅ RabbitMQ连接成功');
    } catch (error) {
      console.error('❌ RabbitMQ连接失败:', error);
      throw error;
    }
  }
  
  async sendToQueue(queue, message, options = {}) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not connected');
    }
    
    return this.channel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(message)),
      options
    );
  }
  
  async consumeQueue(queue, callback) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not connected');
    }
    
    return this.channel.consume(queue, async (msg) => {
      if (msg !== null) {
        try {
          const message = JSON.parse(msg.content.toString());
          await callback(message);
          this.channel.ack(msg);
        } catch (error) {
          console.error('消息处理失败:', error);
          this.channel.nack(msg, false, true); // 重新入队
        }
      }
    });
  }
  
  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}

module.exports = RabbitMQConnection;