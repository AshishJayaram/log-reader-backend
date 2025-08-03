import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LogsService } from './logs.service';
import { LogEntry } from './entities/log-entry.entity';

interface PaginatedLogs {
  data: LogEntry[];
  total: number;
  page: number;
  limit: number;
}

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadLogFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const content = file.buffer.toString('utf-8');
    this.logsService.addLogsFromFile(content);
    return { message: 'Logs uploaded successfully',  count: this.logsService.getLogCount() };
  }

  @Get()
  getLogs(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('vehicleId') vehicleId?: string,
    @Query('level') level?: string,
    @Query('code') code?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('sort') sort: string = 'timestamp',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc'
  ) {
    return this.logsService.getLogs({
      page: +page,
      limit: +limit,
      vehicleId,
      code,
      level,
      from,
      to,
      sort: sort as keyof LogEntry,
      sortOrder,
    });
  }
}
