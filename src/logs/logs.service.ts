import { Injectable } from '@nestjs/common';
import { LogEntry } from './entities/log-entry.entity';

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

  parseLogLine(line: string): LogEntry | null {
    const regex = /\[(.+?)\] \[VEHICLE_ID:(\d+)\] \[(\w+)\] \[CODE:(\w+)\] \[(.+)\]/;
    const match = line.match(regex);
    if (!match) return null;
    const [, timestamp, vehicleId, level, code, message] = match;
    return { timestamp, vehicleId, level, code, message };

  }

  addLogsFromFile(content: string) {
    const lines = content.split('\n');
    const regex = /\[(.+?)\] \[VEHICLE_ID:(\d+)\] \[(\w+)\] \[CODE:(\w+)\] \[(.+)\]/;

    for (const line of lines) {
      const match = line.match(regex);
      if (match) {
        const [, timestamp, vehicleId, level, code, message] = match;
        this.logs.push({ timestamp, vehicleId, level, code, message });
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

  getLogs(filters: {
    page: number;
    limit: number;
    vehicleId?: string;
    level?: string;
    code?: string;
    from?: string;
    to?: string;
    sort?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    let results = [...this.logs]; // logs stored in memory

    const { page, limit, vehicleId, level, code, from, to, sort = 'timestamp', sortOrder = 'asc' } = filters;

    if (vehicleId) results = results.filter(log => log.vehicleId === vehicleId);
    if (level) results = results.filter(log => log.level === level);
    if (code) results = results.filter(log => log.code === code);
    if (from) results = results.filter(log => new Date(log.timestamp) >= new Date(from));
    if (to) results = results.filter(log => new Date(log.timestamp) <= new Date(to));

    results = results.sort((a, b) => {
      const valA = a[sort];
      const valB = b[sort];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const offset = (page - 1) * limit;
    const paginated = results.slice(offset, offset + limit);

    return {
      data: paginated,
      total: results.length,
      page,
      limit
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
