#!/bin/bash

# 简化版部署脚本 - 直接使用docker命令

echo "🚀 开始部署灵感集市项目..."

# 创建必要的目录
mkdir -p backend/uploads
mkdir -p ssl

# 启动MongoDB
echo "📦 启动MongoDB..."
docker run -d \
  --name ideal-market-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -e MONGO_INITDB_DATABASE=ideal_market \
  -v mongodb_data:/data/db \
  mongo:6.0

# 启动Redis
echo "📦 启动Redis..."
docker run -d \
  --name ideal-market-redis \
  -p 6379:6379 \
  redis:7-alpine

# 启动RabbitMQ
echo "📦 启动RabbitMQ..."
docker run -d \
  --name ideal-market-rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=password123 \
  rabbitmq:3.12-management-alpine

# 构建并启动后端
echo "📦 构建并启动后端..."
cd backend && docker build -t ideal-market-backend . && cd ..

docker run -d \
  --name ideal-market-backend \
  --link ideal-market-mongodb:mongodb \
  --link ideal-market-redis:redis \
  --link ideal-market-rabbitmq:rabbitmq \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e MONGODB_URI=mongodb://admin:password123@mongodb:27017/ideal_market?authSource=admin \
  -e REDIS_URL=redis://redis:6379 \
  -e RABBITMQ_URL=amqp://admin:password123@rabbitmq:5672 \
  -v $(pwd)/backend/uploads:/app/uploads \
  ideal-market-backend

# 构建并启动前端
echo "📦 构建并启动前端..."
cd frontend && docker build -t ideal-market-frontend . && cd ..

docker run -d \
  --name ideal-market-frontend \
  -p 8080:80 \
  ideal-market-frontend

echo ""
echo "✅ 部署完成！"
echo ""
echo "服务地址："
echo "🌐 Web前端: http://localhost:8080"
echo "🔧 API文档: http://localhost:3000/api/v1"
echo "📊 RabbitMQ管理: http://localhost:15672 (用户名: admin, 密码: password123)"