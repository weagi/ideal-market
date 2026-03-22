#!/bin/bash

echo "🧪 开始API功能测试..."

# 测试提交灵感
echo "🔍 测试提交灵感..."
response=$(curl -s -X POST http://localhost:3001/api/v1/ideas \
  -H "Content-Type: application/json" \
  -d '{"openid":"test_openid","textContent":"测试灵感"}')

if echo "$response" | grep -q "success.*true"; then
    echo "✅ 提交灵感成功"
else
    echo "❌ 提交灵感失败: $response"
    exit 1
fi

# 测试获取市场列表
echo "🔍 测试获取市场列表..."
market_response=$(curl -s http://localhost:3001/api/v1/ideas/market)

if echo "$market_response" | grep -q "success.*true"; then
    echo "✅ 获取市场列表成功"
else
    echo "❌ 获取市场列表失败: $market_response"
    exit 1
fi

# 测试获取用户灵感列表
echo "🔍 测试获取用户灵感列表..."
user_response=$(curl -s "http://localhost:3001/api/v1/ideas?openid=test_openid")

if echo "$user_response" | grep -q "success.*true"; then
    echo "✅ 获取用户灵感列表成功"
else
    echo "❌ 获取用户灵感列表失败: $user_response"
    exit 1
fi

echo "🎉 API功能测试通过！"