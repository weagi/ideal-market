# 灵感集市 (Ideal Market) ✅ **完整版已开发完成**

一个基于AI辅助的创意想法（Idea）记录与交易平台。

## 🎯 **项目状态**
- ✅ **Web前端**: 完全开发完成，可直接使用
- ✅ **微信公众号H5**: 完整代码已开发，支持语音+图片上传
- ✅ **微信接口测试页面**: 专门用于测试微信公众号功能
- ✅ **后端服务**: 完整架构 + 微信公众号OAuth2.0集成
- ✅ **数据库**: 完整数据模型设计
- ✅ **AI集成**: 完整服务架构（支持多AI提供商）
- ✅ **Docker部署**: 完整的docker-compose配置
- ✅ **完整文档**: 部署指南 + 测试方案 + API文档

## 📱 **核心功能**
- **极简录入**: 语音 + 图片上传，三步以内完成记录
- **AI处理**: 自动转写、分析、生成PRD和闲鱼文案
- **异步处理**: 后台队列处理，用户无需等待
- **状态同步**: 微信通知 + 实时状态管理
- **闲鱼集成**: 一键复制文案，回填链接上架市场
- **安全防护**: 内容风控 + 数据加密 + 权限控制

## 🚀 **快速开始**

### 本地开发模式（推荐）
```bash
# 1. 克隆项目
git clone https://github.com/weagi/ideal-market.git
cd ideal-market

# 2. 安装依赖
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 3. 启动服务
# 终端1: 后端服务
cd backend && npm start

# 终端2: Web前端（实现者市场）
cd frontend && npm run dev -- --port 8082

# 终端3: 微信H5（创意者工作台）
cd wechat-h5 && python3 -m http.server 8084

# 终端4: 测试页面
cd wechat-h5 && python3 -m http.server 8085
```

### 访问服务
- **Web前端**: `http://localhost:8082`
- **微信H5**: `http://localhost:8084`  
- **测试页面**: `http://localhost:8085/simple-wechat-test.html`
- **后端API**: `http://localhost:3001`

## ⚙️ **完整配置指南**

### 1. 环境配置
```bash
# 复制配置模板
cp backend/.env.example backend/.env

# 编辑配置文件
nano backend/.env
```

### 2. 微信公众号配置
在微信公众平台配置：
- **服务器地址**: `https://your-domain.com/api/v1/wechat`
- **网页授权域名**: 您的域名
- **JS接口安全域名**: 您的域名

### 3. AI服务配置
支持多AI提供商切换：
- **ASR**: 阿里云、腾讯云、百度、Azure
- **OCR**: 阿里云、腾讯云、百度、Google  
- **LLM**: OpenAI、通义千问、文心一言、Claude、Gemini

### 4. Docker生产部署
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看状态
docker-compose ps
```

## 🌐 **服务架构**

### 技术栈
- **前端**: Vue3 + Vite + Element Plus
- **微信H5**: HTML5 + 微信JS-SDK
- **后端**: Node.js + Express + MongoDB + Redis
- **AI服务**: 多提供商集成架构
- **部署**: Docker + Nginx + docker-compose

### 目录结构
```
ideal-market/
├── backend/          # 后端API服务
├── frontend/         # Web前端（实现者市场）
├── wechat-h5/        # 微信公众号H5（创意者工作台）
├── docs/             # 项目文档
│   ├── prd.md        # 产品需求文档
│   ├── deployment-guide.md  # 部署指南
│   └── test-plan.md  # 测试方案
├── scripts/          # 脚本工具
│   ├── deploy.sh     # 部署脚本
│   └── test/         # 测试脚本
└── docker-compose.yml # Docker配置
```

## 📊 **测试验证**

### 自动化测试
```bash
# 健康检查
./scripts/test/health-check.sh

# API功能测试  
./scripts/test/api-test.sh
```

### 测试覆盖
- ✅ 服务健康检查
- ✅ API接口功能
- ✅ Web前端功能
- ✅ 微信H5功能
- ✅ 微信接口测试
- ✅ 数据流程验证

## 📈 **生产环境部署**

### 系统要求
- **操作系统**: Ubuntu 22.04 LTS
- **内存**: 4GB RAM+
- **存储**: 50GB SSD
- **依赖**: Node.js v18+, Docker, MongoDB, Redis

### 部署步骤
1. **服务器准备**: 安装必要软件
2. **域名SSL**: 配置HTTPS证书
3. **Nginx配置**: 反向代理设置
4. **系统服务**: systemd服务配置
5. **监控告警**: 日志和健康检查

## 📄 **详细文档**

- **[部署指南](docs/deployment-guide.md)**: 完整的安装、配置、部署说明
- **[产品需求文档](docs/prd.md)**: 详细的功能需求和业务逻辑
- **[测试方案](docs/test-plan.md)**: 完整的测试用例和自动化脚本

## 💡 **下一步配置**

1. **微信公众号**: 在微信公众平台配置服务器和网页授权
2. **AI服务**: 申请ASR、OCR、LLM API密钥并配置
3. **域名SSL**: 配置HTTPS证书（微信要求）
4. **生产部署**: 使用Docker Compose进行容器化部署
5. **监控告警**: 配置服务健康检查和错误监控

## 🔧 **故障排除**

### 常见问题
- **服务无法启动**: 检查端口占用和依赖安装
- **微信JS-SDK失败**: 确认域名配置和HTTPS
- **API返回404**: 检查路由配置和后端状态
- **文件上传失败**: 检查文件大小限制和磁盘空间

### 日志位置
- **后端日志**: `./logs/backend.log`
- **Docker日志**: `docker-compose logs`
- **健康检查**: `./scripts/test/health-check.sh`

---

**灵感集市 V3.0** - 极致轻量化的创意孵化平台，让每一个Idea都能被简单记录、被AI赋能、被市场定价！

**最后更新**: 2026-03-22 | **版本**: v1.0.0