import {Body, Controller, Get, Post, Query} from '@nestjs/common';
import {ApiBody, ApiTags} from '@nestjs/swagger';
import {MessageTrackerService} from './message-tracker.service';

@ApiTags('Message Tracker')
@Controller('message-tracker')
export class MessageTrackerController {
  constructor(private readonly messageTrackerService: MessageTrackerService) {}

  @Get('events')
  async getEventsOfOneMessage(
    @Query('pinpointMessageId') pinpointMessageId: string
  ) {
    return await this.messageTrackerService.getStatusOfOneMessage(
      pinpointMessageId
    );
  }

  @Post('events')
  @ApiBody({
    description: '',
    examples: {
      a: {value: {pinpointMessageIds: ['id1', 'id2']}},
    },
  })
  async getEventsOfManyMessages(@Body() body: {pinpointMessageIds: string[]}) {
    return await this.messageTrackerService.getStatusOfManyMessages(
      body.pinpointMessageIds
    );
  }

  /* End */
}
