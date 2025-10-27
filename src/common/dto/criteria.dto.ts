import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for pagination and sorting criteria
 * Similar to .NET CriteriaModel
 */
export class CriteriaDto {
  @ApiProperty({ description: 'Page number (0-based)', example: 0, default: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  page: number = 0;

  @ApiProperty({ description: 'Items per page', example: 10, default: 10, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageSize: number = 10;

  @ApiProperty({ description: 'Field to sort by', example: 'createdAt', required: false })
  @IsOptional()
  sortField?: string;

  @ApiProperty({ description: 'Sort direction', enum: ['ASC', 'DESC'], example: 'DESC', required: false })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortType?: 'ASC' | 'DESC';
}

