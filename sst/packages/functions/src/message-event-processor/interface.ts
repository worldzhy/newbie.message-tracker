export interface OriginalPinpointMessageEvent {
  event_type: string;
  event_timestamp: number;
  arrival_timestamp: number;
  event_version?: string;
  application?: any;
  client?: any;
  device?: any;
  session?: any;
  attributes?: any;
  metrics?: any;
  facets?: any;
  awsAccountId?: string;
}

export interface MessageEventCreateInput {
  event: {};
  eventType: string;
  eventTime: Date;
  pinpointMessageId: string;
  messageId?: number;
}

export interface S3Event {
  Records: S3Record[];
}

export interface S3Record {
  s3: {
    bucket: {
      name: string;
    };
    object: {
      key: string;
    };
  };
}

export interface EventBridgeEvent {
  detail: {
    bucket: {
      name: string;
    };
    object: {
      key: string;
    };
  };
}
