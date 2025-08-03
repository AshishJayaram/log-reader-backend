import { IsOptional, IsString, IsISO8601 } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  vehicle?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  code?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  level?: string;

  @IsOptional()
  @IsISO8601()
  @ApiPropertyOptional()
  from?: string;

  @IsOptional()
  @IsISO8601()
  @ApiPropertyOptional()
  to?: string;
}
