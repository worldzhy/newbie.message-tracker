import {Function} from 'sst/constructs';

export default {
  config(_input) {
    return {
      name: 'message-tracker',
      region: 'us-east-1',
    };
  },
  stacks(app) {
    app.stack(function Stack({stack}) {
      // 环境变量配置
      const environment = {
        DB_HOST: process.env.DB_HOST || 'localhost',
        DB_PORT: process.env.DB_PORT || '5432',
        DB_USER: process.env.DB_USER || 'postgres',
        DB_PWD: process.env.DB_PWD || 'password',
        DB_NAME: process.env.DB_NAME || 'message_tracker',
        DB_SSL: process.env.DB_SSL || 'false',

        AWS_PINPOINT_REGION: process.env.AWS_PINPOINT_REGION!,
        AWS_PINPOINT_FROM_EMAIL_ADDRESS:
          process.env.AWS_PINPOINT_FROM_EMAIL_ADDRESS!,
        MESSAGE_TRACKER_ADMIN_EMAIL_ADDRESS:
          process.env.MESSAGE_TRACKER_ADMIN_EMAIL_ADDRESS || '',
        MESSAGE_SENDER_LEVEL: process.env.MESSAGE_SENDER_LEVEL || '1', // 默认级别为 1
      };

      // Create the  message sender function
      const messageSender = new Function(stack, 'MessageSender', {
        handler: 'packages/functions/src/message-sender/index.handler',
        timeout: '60 seconds',
        environment,
        permissions: ['ses:SendEmail', 'sms-voice:SendTextMessage'],
      });

      // Create the event stream processor function
      const messageEventProcessor = new Function(
        stack,
        'MessageEventProcessor',
        {
          handler:
            'packages/functions/src/message-event-processor/index.handler',
          timeout: '120 seconds',
          environment,
          permissions: ['s3:GetObject'],
        }
      );

      // Create the failed event processor function
      const failedEventProcessor = new Function(
        stack,
        'FailedMessageProcessor',
        {
          handler:
            'packages/functions/src/failed-message-processor/index.handler',
          timeout: '60 seconds',
          environment,
          permissions: ['ses:SendEmail'],
        }
      );

      stack.addOutputs({
        messageSenderArn: messageSender.functionArn,
        messageEventProcessorArn: messageEventProcessor.functionArn,
        failedEventProcessorArn: failedEventProcessor.functionArn,
      });
    });
  },
} as const;
