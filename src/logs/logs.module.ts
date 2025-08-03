import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogEntry } from './entities/log-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogEntry])],
  providers: [LogsService],
  controllers: [LogsController]
})

export class LogsModule {}
