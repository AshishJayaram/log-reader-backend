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
import { Response } from 'express';
import { Res } from '@nestjs/common';

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

  @Get('export')
  async exportCsv(
    @Res() res: Response,
    @Query('vehicleId') vehicleId?: string,
    @Query('level') level?: string,
    @Query('code') code?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('sort') sort: keyof LogEntry = 'timestamp',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    const csv = await this.logsService.exportCsv({ vehicleId, level, code, from, to, sort, sortOrder });
    res.setHeader('Content-Disposition', 'attachment; filename=logs.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  }
}
