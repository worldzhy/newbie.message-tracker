import {Global, Module} from '@nestjs/common';
import {MessageTrackerService} from './message-tracker.service';

@Global()
@Module({
  providers: [MessageTrackerService],
  exports: [MessageTrackerService],
})
export class MessageTrackerModule {}
