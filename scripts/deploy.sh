#!/bin/bash

# 灵感集市部署脚本

set -e

echo "🚀 开始部署灵感集市项目..."

# 检查Docker和Docker Compose是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 创建必要的目录
mkdir -p backend/uploads
mkdir -p ssl

# 构建并启动服务
echo "🏗️  构建Docker镜像..."
if docker compose version &> /dev/null; then
    docker compose build
else
    docker-compose build
fi

echo "🚀 启动服务..."
if docker compose version &> /dev/null; then
    docker compose up -d
else
    docker-compose up -d
fi

echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
if docker compose version &> /dev/null; then
    docker compose ps
else
    docker-compose ps
fi

echo ""
echo "✅ 部署完成！"
echo ""
echo "服务地址："
echo "🌐 Web前端: http://localhost"
echo "🔧 API文档: http://localhost/api/v1"
echo "📊 RabbitMQ管理: http://localhost:15672 (用户名: admin, 密码: password123)"
echo ""
echo "💡 注意事项："
echo "1. 首次启动可能需要几分钟时间"
echo "2. 请修改 backend/.env 中的敏感配置"
echo "3. 生产环境请配置SSL证书"
echo "4. 微信小程序需要配置真实的AppID和Secret"