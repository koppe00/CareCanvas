import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MaakElementDto {
  @ApiProperty()
  @IsString()
  titel: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  inhoud: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  toelichting?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  gekoppeldAan?: string[];
}

export class WijzigElementStatusDto {
  @ApiProperty()
  @IsString()
  status: string;
}

export class VoegBerichtToeDto {
  @ApiProperty()
  @IsString()
  tekst: string;
}

export class BrengtStemUitDto {
  @ApiProperty({ enum: ['VOOR', 'TEGEN', 'ONTHOUDING'] })
  @IsEnum(['VOOR', 'TEGEN', 'ONTHOUDING'])
  waarde: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  toelichting?: string;
}

export class WijzigElementDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  titel?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  inhoud?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  toelichting?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  gekoppeldAan?: string[];
}
