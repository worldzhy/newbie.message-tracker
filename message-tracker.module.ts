import {Global, Module} from '@nestjs/common';
import {MessageTrackerController} from './message-tracker.controller';
import {MessageTrackerService} from './message-tracker.service';

@Global()
@Module({
  controllers: [MessageTrackerController],
  providers: [MessageTrackerService],
  exports: [MessageTrackerService],
})
export class MessageTrackerModule {}
