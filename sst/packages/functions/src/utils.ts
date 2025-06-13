import {SendEmailParams} from '@message-tracker/core/pinpoint/email';
import {SendTextMessageParams} from '@message-tracker/core/pinpoint/sms';

export enum MessageStatus {
  FAILED = 'FAILED',
}

export enum MessageType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  Unknown = 'Unknown',
}

export interface MessageBody {
  type: MessageType;
  emailParams?: SendEmailParams;
  smsParams?: SendTextMessageParams;
}

export function checkSqsMessageBody(sqsMessageBody: any) {
  if (
    !sqsMessageBody ||
    !sqsMessageBody.type ||
    !Object.values(MessageType).includes(sqsMessageBody.type as MessageType) ||
    (sqsMessageBody.type === MessageType.EMAIL &&
      !sqsMessageBody.emailParams) ||
    (sqsMessageBody.type === MessageType.SMS && !sqsMessageBody.smsParams)
  ) {
    return false;
  } else {
    return true;
  }
}
