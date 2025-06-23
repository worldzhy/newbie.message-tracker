# Message Tracker Microservice

A microservice for tracking and managing message delivery status across multiple channels.

## Features

- Multi-channel support (Email, SMS)
- Real-time message tracking
- Message template management
- Rate limiting and throttling

## File structure

message-tracker/
├── message-tracker.controller.ts # 控制器
├── message-tracker.module.ts # 模块定义
├── message-tracker.service.ts # 服务层
├── cloudformation/ # AWS CloudFormation模板
├── sample-data/ # 示例数据
│ └── message-event-samples  
├── sst/ # Serverless Stack (SST)实现
│ ├── sst.config.ts # SST配置
│ ├── packages/
│ │ ├── core/ # 共享核心代码
│ │ │ ├── src/
│ │ │ │ ├── database/ # 数据库操作
│ │ │ │ ├── pinpoint/ # 邮件和短信服务
│ │ │ │ ├── s3/ # 存储服务
│ │ │ └── package.json
│ │ ├── functions/ # Lambda函数
│ │ │ ├── src/
│ │ │ │ ├── message-sender/ # 消息发送
│ │ │ │ ├── message-event-processor/ # 事件处理
│ │ │ │ └── failed-message-processor/ # 失败消息处理
│ │ │ └── package.json
│ └── .sst/ # SST构建文件
└── .newbie/ # 项目配置

## Getting Started

Overall Steps:

1. Config SES and SMS from AWS console. They both need a configuration set for tracking messages.
2. Develop lambda functions with sst.
3. Download the code of the three lambda functions.
4. Upload the code zips to specific S3(Depends on the parameter 'LambdaCodeS3BucketName' of Cloudformation stack).
5. Create Cloudformation Stack from AWS console.

### Develop Lambda

1. Install dependencies:

```bash
cd ./sst
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

3. Develop lambda:

```bash
npm run dev
```

4. Deploy lambda:

```bash
npm run build
npm run deploy
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
