#!/bin/bash

echo "🧪 开始健康检查..."

# 检查后端服务
echo "🔍 检查后端服务..."
if curl -s http://localhost:3001 | grep -q "灵感集市后端服务"; then
    echo "✅ 后端服务正常"
else
    echo "❌ 后端服务异常"
    exit 1
fi

# 检查Web前端
echo "🔍 检查Web前端..."
if curl -s http://localhost:8082 | grep -q "灵感集市 - 实现者采购市场"; then
    echo "✅ Web前端正常"
else
    echo "❌ Web前端异常"
    exit 1
fi

# 检查微信H5
echo "🔍 检查微信H5..."
if curl -s http://localhost:8084 | grep -q "灵感集市"; then
    echo "✅ 微信H5正常"
else
    echo "❌ 微信H5异常"
    exit 1
fi

# 检查测试页面
echo "🔍 检查测试页面..."
if curl -s http://localhost:8085/simple-wechat-test.html | grep -q "微信公众号接口简易测试"; then
    echo "✅ 测试页面正常"
else
    echo "❌ 测试页面异常"
    exit 1
fi

echo "🎉 所有服务健康检查通过！"