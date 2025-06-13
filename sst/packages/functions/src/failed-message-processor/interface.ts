export enum MessageType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  Unknown = 'Unknown',
}

export interface FailedMessage {
  sqsMessageId: string;
  type: string;
  destination: string;
  content: string;
}
