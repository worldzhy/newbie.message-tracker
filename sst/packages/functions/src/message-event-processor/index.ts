import {S3Handler} from 'aws-lambda';
import {Database} from '@message-tracker/core/database';
import {S3Service} from '@message-tracker/core/s3';
import moment from 'moment';
import {
  OriginalPinpointMessageEvent,
  MessageEventCreateInput,
} from './interface.js';

export const handler: S3Handler = async event => {
  if (!event.Records || event.Records.length <= 0) {
    return;
  }

  // Initialize database connection
  const db = new Database();
  const s3 = new S3Service();

  // Function to store Pinpoint message events in the database
  const storeMessageEvents = async (events: Array<MessageEventCreateInput>) => {
    if (events.length === 0) return;

    for (const event of events) {
      await db.sql`
        INSERT INTO "microservice/message-tracker"."MessageEvent" ${db.sql(
          event
        )}`;
    }
  };

  try {
    // Fetch the event stream file from S3
    const s3Bucket = event.Records[0].s3.bucket.name;
    const s3Key = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, ' ')
    );
    const response = await s3.getObject({bucket: s3Bucket, key: s3Key});
    const eventStreamContent = await response.Body?.transformToString();

    if (!eventStreamContent) {
      throw new Error('Failed to read S3 object content');
    }

    // Split the event stream content into individual events
    const eventStrings = eventStreamContent.split('\n');
    const originalEvents: OriginalPinpointMessageEvent[] = [];
    for (const eventString of eventStrings) {
      if (eventString.length > 0) {
        originalEvents.push(JSON.parse(eventString));
      }
    }

    // Process each original event to extract relevant information
    const pinpointMessageEvents: Array<MessageEventCreateInput> = [];
    for (const originalEvent of originalEvents) {
      const {event_type} = originalEvent;
      let pinpointMessageId: string;

      if (event_type.startsWith('_email')) {
        pinpointMessageId =
          originalEvent.facets?.email_channel?.mail_event?.mail?.message_id;
      } else if (event_type.startsWith('_SMS')) {
        pinpointMessageId = originalEvent.attributes?.message_id;
      } else {
        pinpointMessageId = 'unknown';
      }

      pinpointMessageEvents.push({
        eventType: event_type,
        event: {
          ...originalEvent,
          event_timestamp: originalEvent.event_timestamp
            ? moment(originalEvent.event_timestamp).format(
                'YYYY-MM-DD HH:mm:ss'
              )
            : null,
          arrival_timestamp: originalEvent.arrival_timestamp
            ? moment(originalEvent.arrival_timestamp).format(
                'YYYY-MM-DD HH:mm:ss'
              )
            : null,
        },
        pinpointMessageId: pinpointMessageId,
      });
    }

    // Assign message IDs to pinpointMessageEvents
    const pinpointMessageIds = pinpointMessageEvents
      .filter(event => event.pinpointMessageId !== undefined)
      .map(event => event.pinpointMessageId);

    const messages = await db.sql`
      select "id", "pinpointMessageId" from "microservice/message-tracker"."Message"
      where "pinpointMessageId" in ${db.sql(pinpointMessageIds)}
    `;

    const messageMap = new Map(
      messages.map(msg => [msg.pinpointMessageId, msg.id])
    );

    pinpointMessageEvents.forEach(event => {
      const messageId = messageMap.get(event.pinpointMessageId);
      if (messageId) {
        event.messageId = messageId;
      }
    });

    // Store Pinpoint message events in the database
    await storeMessageEvents(pinpointMessageEvents);
  } catch (error) {
    console.error('Error processing Pinpoint events:', error);
    throw error;
  } finally {
    await db.close();
  }
};
