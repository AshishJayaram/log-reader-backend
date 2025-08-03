import { Injectable } from '@nestjs/common';
import { LogEntry } from './entities/log-entry.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Raw } from 'typeorm';

interface PaginatedResult<T> {
  data: T[];
  total: number;
  level: string;
  page: number;
  limit: number;
}

@Injectable()
export class LogsService {
  private logs: LogEntry[] = [];

  constructor(
      @InjectRepository(LogEntry)
      private readonly logRepository: Repository<LogEntry>,
    ) {}
  parseLogLine(line: string): LogEntry | null {
  const regex = /\[(.+?)\] \[VEHICLE_ID:(\d+)\] \[(\w+)\] \[CODE:(\w+)\] \[(.+)\]/;
  const match = line.match(regex);
  if (!match) return null;
  const [, timestamp, vehicleId, level, code, message] = match;

  return {
    id: Date.now() + Math.random(),
    timestamp,
    vehicleId,
    level,
    code,
    message
  };
}

  async addLogsFromFile(content: string) {
    const lines = content.split('\n');
    const regex = /\[(.+?)\] \[VEHICLE_ID:(\d+)\] \[(\w+)\] \[CODE:(\w+)\] \[(.+)\]/;

    for (const line of lines) {
      const match = line.match(regex);
      if (match) {
        const [, timestamp, vehicleId, level, code, message] = match;

        await this.logRepository.save({
          timestamp,
          vehicleId,
          level,
          code,
          message
        });
      }
    }
  }

  findAll(filters: {
    vehicleId?: string;
    code?: string;
    level?: string;
    from?: string;
    to?: string;
  }): LogEntry[] {
    return this.logs.filter(log => {
      const timestamp = new Date(log.timestamp).getTime();
      return (!filters.vehicleId || log.vehicleId === filters.vehicleId)
        && (!filters.level || log.code === filters.level)
        && (!filters.code || log.code === filters.code)
        && (!filters.from || timestamp >= new Date(filters.from).getTime())
        && (!filters.to || timestamp <= new Date(filters.to).getTime());
    });
  }

  async getLogs(filters: {
    page: number;
    limit: number;
    vehicleId?: string;
    level?: string;
    code?: string;
    from?: string;
    to?: string;
    sort?: keyof LogEntry;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page,
      limit,
      vehicleId,
      level,
      code,
      from,
      to,
      sort = 'timestamp',
      sortOrder = 'asc',
    } = filters;

    const where: any = {};

    if (vehicleId) where.vehicleId = vehicleId;
    if (level) where.level = level;
    if (code) where.code = code;

    // Proper date filtering using Raw
    if (from && to) {
      where.timestamp = Raw(
        (alias) => `${alias} BETWEEN :from AND :to`,
        { from, to }
      );
    } else if (from) {
      where.timestamp = Raw(
        (alias) => `${alias} >= :from`,
        { from }
      );
    } else if (to) {
      where.timestamp = Raw(
        (alias) => `${alias} <= :to`,
        { to }
      );
    }

    const [data, total] = await this.logRepository.findAndCount({
      where,
      order: {
        [sort]: sortOrder.toUpperCase(), // 'ASC' or 'DESC'
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  getLogCount(): number {
    return this.logs.length;
  }

  getFilteredLogs({ page, limit, level, vehicleId, code, from, to }: {
      page: number;
      limit: number;
      vehicleId?: string;
      level?: string;
      code?: string;
      from?: string;
      to?: string;
    }) {
    let results = [...this.logs]; // don't mutate the original list

    if (vehicleId) results = results.filter(log => log.vehicleId === vehicleId);
    if (level) results = results.filter(log => log.level === level);
    if (code) results = results.filter(log => log.code === code);
    if (from) results = results.filter(log => new Date(log.timestamp) >= new Date(from));
    if (to) results = results.filter(log => new Date(log.timestamp) <= new Date(to));

    const total = results.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = results.slice(start, end);

    return {
      data: paginated,
      total,
      page,
      limit
    };
  }
}
