# Message Tracker

基于 SST 框架的消息追踪系统，用于跟踪和监控 AWS Pinpoint 发送的邮件和短信消息。

## 项目结构

```
├── package.json           # 根包配置
├── sst.config.ts          # SST 配置
├── tsconfig.json          # TypeScript 配置
└── packages/
    ├── core/              # 核心共享代码
    │   ├── src/
    │   │   ├── database/  # 数据库操作
    │   │   ├── email/     # 邮件服务
    │   │   ├── sms/       # 短信服务
    │   │   └── types/     # 类型定义
    │   └── package.json
    ├── functions/         # Lambda 函数
    │   ├── src/
    │   │   ├── pinpoint-message-sender.ts    # 消息发送
    │   │   ├── alarm-message-sender.ts       # 告警发送
    │   │   └── pinpoint-event-receiver.ts    # 事件接收
    │   └── package.json
    └── scripts/           # 数据库脚本
        ├── database.sql
        ├── setup-database.js
        └── package.json
```

## 功能特性

### 1. Pinpoint 消息发送器 (pinpoint-message-sender)

- 从 SQS 队列接收消息
- 支持邮件和短信发送
- 使用 `postgres` 客户端替代 `pg`
- 基于最新的邮件和短信服务封装

### 2. 告警消息发送器 (alarm-message-sender)

- 处理失败消息的告警
- 生成 HTML 格式的失败列表
- 发送给指定的告警邮箱

### 3. Pinpoint 事件接收器 (pinpoint-event-receiver)

- 处理 S3 和 EventBridge 触发的事件
- 解析 Pinpoint 事件流
- 分别存储邮件和短信事件

## 环境配置

需要设置以下环境变量（通过 SST 的 Config.Secret）：

```bash
# 数据库配置
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PWD=your-db-password
DB_NAME=your-db-name
DB_SSL=true

# AWS Pinpoint 配置
AWS_PINPOINT_REGION=us-east-1
FROM_EMAIL_ADDRESS=your-from-email
ADMIN_EMAIL_ADDRESS=your-admin-email

# AWS 凭证
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

## 部署步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 设置环境变量

```bash
npx sst secrets set DB_HOST your-db-host
npx sst secrets set DB_PORT 5432
npx sst secrets set DB_USER your-db-user
npx sst secrets set DB_PWD your-db-password
npx sst secrets set DB_NAME your-db-name
npx sst secrets set AWS_PINPOINT_APPLICATION_ID your-pinpoint-app-id
npx sst secrets set FROM_EMAIL_ADDRESS your-from-email
npx sst secrets set ADMIN_EMAIL_ADDRESS your-alarm-email
npx sst secrets set AWS_ACCESS_KEY_ID your-access-key
npx sst secrets set AWS_SECRET_ACCESS_KEY your-secret-key
```

### 3. 设置数据库

```bash
# 设置环境变量
export DB_HOST=your-db-host
export DB_PORT=5432
export DB_USER=your-db-user
export DB_PWD=your-db-password
export DB_NAME=your-db-name

# 运行数据库设置脚本
cd packages/scripts
npm run setup:db
```

### 4. 部署到 AWS

```bash
# 开发环境部署
npm run dev

# 生产环境部署
npm run deploy
```

## 技术栈

- **SST (Serverless Stack)**: 基础设施即代码
- **AWS Lambda**: 无服务器计算
- **AWS SQS**: 消息队列
- **AWS Pinpoint**: 邮件和短信发送
- **PostgreSQL**: 数据库
- **postgres**: 数据库客户端（替代 pg）
- **TypeScript**: 类型安全的 JavaScript
- **Workspace**: 单仓库多包管理

## 数据库表结构

- `_message.received_sqs_messages`: 接收到的 SQS 消息
- `_message.sent_pinpoint_messages`: 发送的 Pinpoint 消息
- `_message.failed_sqs_messages`: 失败的 SQS 消息
- `_message.pinpoint_events_email`: 邮件事件
- `_message.pinpoint_events_sms`: 短信事件

## 开发说明

项目使用 workspace 架构，共享代码位于 `packages/core`，包含：

- **数据库服务**: 使用 `postgres` 客户端进行数据库操作
- **邮件服务**: 基于 AWS Pinpoint 的邮件发送，支持模板和 HTML
- **短信服务**: 基于 AWS Pinpoint 的短信发送
- **类型定义**: 共享的 TypeScript 类型

所有 Lambda 函数都依赖 core 包，确保代码复用和一致性。
