# 灵感集市 - 完整部署和配置指南

## 🎯 目录
- [系统要求](#系统要求)
- [快速开始](#快速开始)
- [环境配置](#环境配置)
- [微信公众号配置](#微信公众号配置)
- [AI服务配置](#ai服务配置)
- [Docker部署](#docker部署)
- [生产环境部署](#生产环境部署)
- [故障排除](#故障排除)

## 🖥️ 系统要求

### 最低配置
- **操作系统**: Ubuntu 20.04+ / CentOS 7+ / macOS / Windows
- **内存**: 2GB RAM
- **存储**: 10GB 可用空间
- **网络**: 稳定的互联网连接

### 推荐配置（生产环境）
- **操作系统**: Ubuntu 22.04 LTS
- **CPU**: 2核+
- **内存**: 4GB RAM+
- **存储**: 50GB SSD
- **网络**: 100Mbps+

### 依赖软件
- **Node.js**: v18+
- **npm**: v8+
- **Docker**: v20+ (可选，用于容器化部署)
- **Docker Compose**: v2+ (可选)
- **MongoDB**: v6.0+ (完整版需要)
- **Redis**: v7+ (完整版需要)

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/weagi/ideal-market.git
cd ideal-market
```

### 2. 安装依赖
```bash
# 后端依赖
cd backend && npm install && cd ..

# Web前端依赖  
cd frontend && npm install && cd ..

# 微信H5无需额外依赖
```

### 3. 启动服务（开发模式）
```bash
# 终端1: 启动后端服务
cd backend && npm start

# 终端2: 启动Web前端（实现者市场）
cd frontend && npm run dev -- --port 8082

# 终端3: 启动微信H5（创意者工作台）
cd wechat-h5 && python3 -m http.server 8084

# 终端4: 启动测试页面
cd wechat-h5 && python3 -m http.server 8085
```

### 4. 访问服务
- **Web前端**: `http://localhost:8082`
- **微信H5**: `http://localhost:8084`
- **测试页面**: `http://localhost:8085/simple-wechat-test.html`
- **后端API**: `http://localhost:3001`

## ⚙️ 环境配置

### 配置文件位置
所有配置都在 `backend/.env` 文件中管理。

### 创建配置文件
```bash
# 复制示例配置
cp backend/.env.example backend/.env

# 编辑配置文件
nano backend/.env
```

### 完整配置参数说明

#### 基础配置
```env
# 服务器配置
NODE_ENV=production          # 环境: development/production
PORT=3001                   # 后端服务端口

# 安全配置
JWT_SECRET=your-jwt-secret-key-change-in-production  # JWT密钥
```

#### 数据库配置（完整版）
```env
# MongoDB配置
MONGODB_URI=mongodb://admin:password123@localhost:27017/ideal_market?authSource=admin

# Redis配置  
REDIS_URL=redis://localhost:6379
```

#### 微信公众号配置
```env
# 微信公众号配置（必须配置才能使用OAuth2.0）
WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret
WECHAT_TOKEN=your-wechat-token
WECHAT_ENCODING_AES_KEY=  # 消息加解密密钥（可选）
```

#### AI服务配置
```env
# 语音转文字 (ASR)
ASR_PROVIDER=mock           # mock/aliyun/tencent/baidu/azure
ASR_API_KEY=your-asr-api-key
ASR_SECRET=your-asr-secret

# 图片OCR识别
OCR_PROVIDER=mock           # mock/aliyun/tencent/baidu/google  
OCR_API_KEY=your-ocr-api-key
OCR_SECRET=your-ocr-secret

# 大语言模型 (LLM)
LLM_PROVIDER=mock           # mock/openai/qwen/wenxin/claude/gemini
LLM_API_KEY=your-llm-api-key
LLM_MODEL=qwen-max          # 根据提供商选择具体模型
```

#### 其他配置
```env
# 文件上传限制
UPLOAD_MAX_SIZE=10485760    # 10MB

# AI处理超时
AI_PROCESSING_TIMEOUT=300000  # 5分钟

# 闲鱼集成（可选）
XIANYU_APP_KEY=your-xianyu-app-key
```

## 📱 微信公众号配置

### 1. 微信公众平台设置
登录 [微信公众平台](https://mp.weixin.qq.com/) 进行以下配置：

#### 基本配置
- **服务器配置**:
  - URL: `https://your-domain.com/api/v1/wechat`
  - Token: 与 `.env` 中 `WECHAT_TOKEN` 一致
  - EncodingAESKey: 与 `.env` 中 `WECHAT_ENCODING_AES_KEY` 一致

#### 网页授权
- **网页授权域名**: 添加您的域名（如 `your-domain.com`）
- **JS接口安全域名**: 添加您的域名

#### 菜单配置（可选）
在自定义菜单中添加：
- **主菜单**: "灵感集市"
- **子菜单**: 
  - "记录灵感" → `https://your-domain.com/wechat-h5/`
  - "我的灵感" → `https://your-domain.com/wechat-h5/my-ideas.html`

### 2. 域名和SSL证书
微信公众号要求：
- **HTTPS**: 必须使用HTTPS协议
- **有效证书**: SSL证书必须有效且未过期
- **域名备案**: 国内服务器需要域名备案

### 3. 本地开发调试
本地开发时可以：
- 使用HTTP协议（仅限localhost）
- 使用微信开发者工具的"公众号网页调试"功能
- 使用ngrok等工具将本地服务暴露到公网

## 🤖 AI服务配置

### 支持的AI提供商

#### 语音转文字 (ASR)
| 提供商 | 配置值 | 特点 |
|--------|--------|------|
| 阿里云 | `aliyun` | 中文优化，准确率高 |
| 腾讯云 | `tencent` | 免费额度大 |
| 百度 | `baidu` | 语音识别强 |
| Azure | `azure` | 国际标准 |

#### 图片OCR识别
| 提供商 | 配置值 | 特点 |
|--------|--------|------|
| 阿里云 | `aliyun` | 手写体识别好 |
| 腾讯云 | `tencent` | 表格识别强 |
| 百度 | `baidu` | 通用OCR优秀 |
| Google | `google` | 国际多语言 |

#### 大语言模型 (LLM)
| 提供商 | 配置值 | 特点 |
|--------|--------|------|
| OpenAI | `openai` | 功能最全面 |
| 通义千问 | `qwen` | 中文效果最佳 |
| 文心一言 | `wenxin` | 百度生态集成 |
| Claude | `claude` | 长文本处理强 |
| Gemini | `gemini` | Google最新模型 |

### 配置步骤

#### 1. 选择提供商
根据需求选择合适的AI提供商，在 `.env` 中设置：
```env
ASR_PROVIDER=qwen
OCR_PROVIDER=aliyun  
LLM_PROVIDER=openai
```

#### 2. 获取API密钥
- **阿里云**: 控制台 → 产品 → 智能语音交互/OCR
- **腾讯云**: 控制台 → 产品 → 语音识别/OCR  
- **OpenAI**: platform.openai.com → API Keys
- **通义千问**: dashscope.console.aliyun.com

#### 3. 填入配置
```env
# 示例：通义千问配置
LLM_PROVIDER=qwen
LLM_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
LLM_MODEL=qwen-max

# 示例：阿里云OCR配置
OCR_PROVIDER=aliyun
OCR_API_KEY=LTAIxxxxxxxxxxxxx
OCR_SECRET=xxxxxxxxxxxxxxxxxxxxxx
```

#### 4. 实现API调用
在 `backend/services/aiServices.js` 中实现具体的API调用逻辑。

## 🐳 Docker部署

### 1. 构建镜像
```bash
# 构建所有服务
docker-compose build

# 或单独构建
docker build -t ideal-market-backend ./backend
docker build -t ideal-market-frontend ./frontend
```

### 2. 配置环境
```bash
# 复制并编辑Docker环境配置
cp backend/.env docker/.env

# 编辑docker/.env配置数据库密码等
nano docker/.env
```

### 3. 启动服务
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
```

### 4. Docker Compose配置说明
`docker-compose.yml` 包含以下服务：
- **mongodb**: 数据库服务
- **redis**: 缓存和任务队列
- **backend**: API服务
- **frontend**: Web前端
- **nginx**: 反向代理

### 5. 持久化存储
- **数据库数据**: `./data/mongodb`
- **上传文件**: `./backend/uploads`
- **日志文件**: `./logs`

## 🏭 生产环境部署

### 1. 服务器准备
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要软件
sudo apt install -y nodejs npm mongodb redis nginx certbot

# 安装Docker（可选）
curl -fsSL https://get.docker.com | sh
```

### 2. 域名和SSL
```bash
# 申请SSL证书
sudo certbot --nginx -d your-domain.com

# 自动续期
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### 3. Nginx配置
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Web前端
    location / {
        proxy_pass http://localhost:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # 微信H5
    location /wechat-h5/ {
        alias /path/to/ideal-market/wechat-h5/;
        try_files $uri $uri/ =404;
    }
    
    # API服务
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. 系统服务配置
创建 systemd 服务文件 `/etc/systemd/system/ideal-market.service`:

```ini
[Unit]
Description=Ideal Market Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/ideal-market
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

启用服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable ideal-market
sudo systemctl start ideal-market
```

### 5. 监控和日志
```bash
# 日志轮转
sudo logrotate -f /etc/logrotate.d/ideal-market

# 健康检查
curl -s https://your-domain.com/api/v1/

# 性能监控
pm2 monit  # 如果使用PM2
```

## 🛠️ 故障排除

### 常见问题及解决方案

#### 1. 服务无法启动
**问题**: 端口被占用
**解决**: 
```bash
# 查看端口占用
lsof -i :3001

# 杀死占用进程
kill -9 <PID>
```

#### 2. 微信JS-SDK初始化失败
**问题**: 域名未配置或HTTPS问题
**解决**:
- 确认域名已添加到JS接口安全域名
- 确认使用HTTPS协议
- 检查AppID和AppSecret配置

#### 3. API返回404错误
**问题**: 路由配置错误
**解决**:
- 确认后端服务正在运行
- 检查API路径是否正确
- 查看后端日志获取详细错误

#### 4. 文件上传失败
**问题**: 文件大小超限或格式不支持
**解决**:
- 检查 `UPLOAD_MAX_SIZE` 配置
- 确认文件类型为图片或音频
- 检查磁盘空间是否充足

#### 5. AI处理超时
**问题**: AI服务响应慢或网络问题
**解决**:
- 增加 `AI_PROCESSING_TIMEOUT` 值
- 检查AI服务API密钥是否有效
- 确认网络连接正常

### 日志位置
- **后端日志**: `./logs/backend.log`
- **Docker日志**: `docker-compose logs`
- **Nginx日志**: `/var/log/nginx/`
- **系统日志**: `/var/log/syslog`

### 健康检查脚本
```bash
# 运行健康检查
./scripts/test/health-check.sh

# 运行API测试
./scripts/test/api-test.sh
```

## 📊 性能优化建议

### 1. 数据库优化
- 创建适当的索引
- 使用连接池
- 定期清理旧数据

### 2. 缓存策略
- Redis缓存频繁访问的数据
- 浏览器缓存静态资源
- CDN加速图片和JS/CSS文件

### 3. 负载均衡
- 使用Nginx进行负载均衡
- 部署多个后端实例
- 数据库读写分离

### 4. 监控告警
- 配置服务健康检查
- 设置性能指标监控
- 邮件/短信告警通知

---

**最后更新**: 2026-03-22  
**版本**: v1.0.0