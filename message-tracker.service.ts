import {Injectable} from '@nestjs/common';
import {PrismaService} from '@framework/prisma/prisma.service';

@Injectable()
export class MessageTrackerService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatusOfOneMessage(pinpointMessageId: string) {
    const event = await this.prisma.messageEvent.findFirstOrThrow({
      where: {pinpointMessageId},
      orderBy: {eventTime: 'desc'},
      select: {eventType: true},
    });

    return event.eventType.split('.')[1].toUpperCase();
  }

  async getStatusOfManyMessages(pinpointMessageIds: string[]) {
    // [step 1] Get events
    const events = await this.prisma.messageEvent.findMany({
      where: {pinpointMessageId: {in: pinpointMessageIds}},
      orderBy: {eventTime: 'desc'},
      select: {eventType: true, pinpointMessageId: true},
    });

    // [step 2] Create a map messageId => status
    const messageIdAndStatusMap = new Map();
    events.forEach(event => {
      if (messageIdAndStatusMap.get(event.pinpointMessageId) === undefined) {
        messageIdAndStatusMap.set(
          event.pinpointMessageId,
          event.eventType.split('.')[1].toUpperCase()
        );
      }
    });

    return messageIdAndStatusMap.keys();
  }
}
