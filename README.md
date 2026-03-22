# 灵感集市 (Ideal Market)

一个基于AI辅助的创意想法（Idea）记录与交易平台。

## 产品定位
连接"创意拥有者"与"AI开发力量"。降低创意记录门槛，利用AI将碎片化灵感转化为规范的需求文档，促进创意的商业化变现或落地开发。

## 项目架构

### 📱 微信小程序端 (miniapp/)
创意者工作台 - 极简录入、状态管理、成果交付

### 💻 Web前端 (frontend/)
实现者采购市场 - 只读浏览、项目详情、闲鱼跳转

### ⚙️ 后端服务 (backend/)
- API网关：处理小程序和Web端请求
- 异步任务队列：消息队列 + AI处理集群
- 微信通知服务：状态变更推送
- 链接监测服务：闲鱼链接有效性检查

### 🗄️ 数据库 (database/)
- 用户表：存储创意者信息
- 灵感表：存储原始灵感数据和AI处理结果
- 状态表：跟踪处理状态和闲鱼链接

### 📄 文档 (docs/)
- `prd.md` - 产品需求文档
- `api-spec.md` - API接口规范
- `architecture.md` - 系统架构设计

## 技术栈
- **小程序**: 微信小程序原生框架
- **Web前端**: Vue.js + Element UI
- **后端**: Node.js + Express + RabbitMQ/Redis
- **数据库**: MongoDB (灵活的文档结构适合AI生成内容)
- **AI服务**: 集成ASR、OCR、LLM API
- **部署**: Docker + Nginx

## 快速开始
```bash
# 1. 克隆项目
git clone https://github.com/weagi/ideal-market.git

# 2. 启动后端服务
cd backend && npm install && npm start

# 3. 启动前端开发服务器
cd frontend && npm install && npm run dev

# 4. 小程序开发
# 使用微信开发者工具打开 miniapp/ 目录
```

## 核心业务流程
1. 创意者在小程序提交灵感（语音/图/文）
2. 后端保存原始数据，状态设为"处理中"
3. 推送异步任务到消息队列
4. AI处理集群消费任务，生成PRD和闲鱼文案
5. 更新数据库状态为"已完成"，触发微信通知
6. 创意者回填闲鱼链接后，数据同步到Web端市场