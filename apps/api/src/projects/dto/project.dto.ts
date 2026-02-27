import { IsString, IsOptional, IsBoolean, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '../entities/project.entity';

export class MaakProjectDto {
  @ApiProperty({ example: 'Medicatiebeheer in de thuiszorg' })
  @IsString()
  titel: string;

  @ApiProperty()
  @IsString()
  beschrijving: string;

  @ApiProperty({ example: 'THUISZORG' })
  @IsString()
  zorgDomein: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPubliek?: boolean;
}

export class WijzigProjectStatusDto {
  @ApiProperty({ enum: ProjectStatus })
  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}
