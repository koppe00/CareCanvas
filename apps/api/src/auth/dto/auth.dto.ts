import { IsEmail, IsString, MinLength, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'jan@ziekenhuis.nl' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Jan de Vries' })
  @IsString()
  naam: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  wachtwoord: string;

  @ApiPropertyOptional({ example: ['DROMER'] })
  @IsOptional()
  @IsArray()
  rollen?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  organisatie?: string;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  wachtwoord: string;
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  gebruiker: {
    id: string;
    email: string;
    naam: string;
    rollen: string[];
  };
}
