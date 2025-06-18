import {MessageType} from '../utils';

export interface MessageCreateInput {
  type: MessageType;
  destination: string;
  content: string;
  sqsMessageId: string;
  sqsMessageBody: {};
  pinpointMessageId?: string;
  pinpointMessageStatus?: number;
  pinpointMessageResponse: {};
  updatedAt: Date;
}
