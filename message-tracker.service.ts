import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@framework/prisma/prisma.service';

@Injectable()
export class MessageTrackerService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {}
}
