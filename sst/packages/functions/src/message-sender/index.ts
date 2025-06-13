import {SQSHandler} from 'aws-lambda';
import {Database} from '@message-tracker/core/database';
import {
  EmailService,
  SendEmailParams,
} from '@message-tracker/core/pinpoint/email';
import {
  TextMessageService,
  SendTextMessageParams,
} from '@message-tracker/core/pinpoint/sms';
import {MessageCreateInput} from './interface.js';
import {checkSqsMessageBody, MessageType, MessageBody} from '../utils.js';

export const handler: SQSHandler = async event => {
  if (!event.Records || event.Records.length <= 0) {
    return;
  }

  // Initialize services
  const db = new Database();
  const email = new EmailService();
  const sms = new TextMessageService();
  const storeMessage = async (params: MessageCreateInput) => {
    await db.sql`INSERT INTO "microservice/message-tracker"."Message" ${db.sql(
      params
    )}`;
  };
  const senderLevel = parseInt(process.env.MESSAGE_SENDER_LEVEL || '1');

  // Process each SQS record
  try {
    for (const sqsRecord of event.Records) {
      const sqsMessageBody = JSON.parse(sqsRecord.body) as MessageBody;

      // Validate received message body
      if (!checkSqsMessageBody(sqsMessageBody)) {
        continue;
      }

      // Extract message type
      const messageType = sqsMessageBody.type;

      // Send message
      let response;

      if (messageType === MessageType.EMAIL) {
        const sendEmailParams = sqsMessageBody.emailParams as SendEmailParams;

        // Send email
        response = await email.sendEmail(sendEmailParams!);

        // Store response
        await storeMessage({
          type: messageType,
          level: senderLevel,
          destination: sendEmailParams.toAddress,
          content: sendEmailParams.html,
          sqsMessageId: sqsRecord.messageId,
          sqsMessageBody: sqsMessageBody,
          pinpointMessageId: response.MessageId,
          pinpointMessageStatus: response.$metadata.httpStatusCode,
          pinpointMessageResponse: response.$metadata,
          updatedAt: new Date(),
        });

        // Delay for email sending
        await sleep(100);
      } else if (messageType === MessageType.SMS) {
        const SendTextMessageParams =
          sqsMessageBody.smsParams as SendTextMessageParams;

        // Send SMS
        response = await sms.sendText(SendTextMessageParams);

        // Store response
        await storeMessage({
          type: messageType,
          level: senderLevel,
          destination: SendTextMessageParams.phoneNumber,
          content: SendTextMessageParams.text,
          sqsMessageId: sqsRecord.messageId,
          sqsMessageBody: sqsMessageBody,
          pinpointMessageId: response.MessageId,
          pinpointMessageStatus: response.$metadata.httpStatusCode,
          pinpointMessageResponse: response.$metadata,
          updatedAt: new Date(),
        });

        // Delay for SMS sending
        await sleep(1000);
      } else {
        console.error('Unknown message type received:', sqsMessageBody.type);
      }
    }
  } catch (error) {
    console.error('Error processing messages:', error);
    throw error;
  } finally {
    await db.close();
  }
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
