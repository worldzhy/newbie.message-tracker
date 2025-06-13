import {SQSHandler} from 'aws-lambda';
import {Database} from '@message-tracker/core/database';
import {EmailService} from '@message-tracker/core/pinpoint/email';
import {FailedMessage, MessageType} from './interface.js';
import {checkSqsMessageBody, MessageBody, MessageStatus} from '../utils.js';

export * from './interface.js';
export const handler: SQSHandler = async event => {
  if (!event.Records || event.Records.length <= 0) {
    return;
  }

  // Initialize services
  const db = new Database();
  const email = new EmailService();
  const adminEmailAddress = process.env.MESSAGE_TRACKER_ADMIN_EMAIL_ADDRESS!;

  // Function to store SQS message in the database
  const markFailedMessages = async (sqsMessageIds: string[]) => {
    await db.sql`
        update "microservice/message-tracker"."Message"
        set "status" = ${MessageStatus.FAILED}
        where "sqsMessageId" in ${db.sql(sqsMessageIds)}
    `;
  };

  try {
    // Collect failed messages
    const failedMessages: FailedMessage[] = [];
    for (const sqsRecord of event.Records) {
      const sqsMessageId = sqsRecord.messageId;
      const sqsMessageBody = JSON.parse(sqsRecord.body) as MessageBody;

      // Validate received message body
      if (!checkSqsMessageBody(sqsMessageBody)) {
        continue;
      }

      // Extract message type
      const messageType = sqsMessageBody.type;

      // Parse the message body to determine the type of message
      if (messageType === MessageType.EMAIL) {
        failedMessages.push({
          sqsMessageId,
          type: MessageType.EMAIL,
          destination: sqsMessageBody.emailParams!.toAddress,
          content: sqsMessageBody.emailParams!.html,
        });
      } else if (messageType === MessageType.SMS) {
        failedMessages.push({
          sqsMessageId,
          type: MessageType.SMS,
          destination: sqsMessageBody.smsParams!.phoneNumber,
          content: sqsMessageBody.smsParams!.text,
        });
      } else {
      }
    }

    // Update messages status in database
    await markFailedMessages(failedMessages.map(msg => msg.sqsMessageId));

    // If there are failed messages, send an email with the list
    if (failedMessages.length > 0) {
      const content = generateAlarmEmailHTML(failedMessages);
      const emailParams = {
        toAddress: adminEmailAddress,
        subject: 'Failed Messages',
        html: content,
        text: content,
      };

      await email.sendEmail(emailParams);
    }
  } catch (error) {
    console.error('Error processing alarm messages:', error);
    throw error;
  } finally {
    await db.close();
  }
};

// 生成告警邮件的 HTML 内容
function generateAlarmEmailHTML(
  records: Array<{
    type: string;
    destination: string;
    content: string;
  }>
): string {
  let htmlStr = `
    <!doctype html>
    <html>
        <head>
            <title>Send Failed List</title>
            <meta charset="utf-8" />
        </head>
        <body>
            <table>
                <tr>
                    <td>Type</td>
                    <td>Destination</td>
                    <td>Content</td>
                </tr> 
    `;
  for (const record of records) {
    const {type, destination, content} = record;
    htmlStr += `
            <tr>
                <td>${type}</td>
                <td>${destination}</td>
                <td><pre>${content}</pre></td>
            </tr>
        `;
  }
  htmlStr += `
            </table>
        </body>
    </html>
    `;
  return htmlStr;
}
