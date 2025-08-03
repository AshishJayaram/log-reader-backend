import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LogEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  timestamp: string;

  @Column()
  vehicleId: string;

  @Column()
  level: string;

  @Column()
  code: string;

  @Column()
  message: string;
}
