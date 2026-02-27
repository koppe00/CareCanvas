import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '../users/entities/user.entity';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const bestaand = await this.userRepo.findOne({ where: { email: dto.email } });
    if (bestaand) throw new ConflictException('E-mailadres is al in gebruik');

    const wachtwoordHash = await bcrypt.hash(dto.wachtwoord, 12);
    const user = this.userRepo.create({
      email: dto.email,
      naam: dto.naam,
      wachtwoordHash,
      rollen: (dto.rollen as any) ?? ['DROMER'],
      organisatie: dto.organisatie,
    });
    const opgeslagen = await this.userRepo.save(user);
    return this.genereerTokens(opgeslagen);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'email', 'naam', 'wachtwoordHash', 'rollen', 'actief'],
    });
    if (!user || !user.actief) throw new UnauthorizedException('Ongeldige inloggegevens');

    const geldig = await bcrypt.compare(dto.wachtwoord, user.wachtwoordHash);
    if (!geldig) throw new UnauthorizedException('Ongeldige inloggegevens');

    return this.genereerTokens(user);
  }

  private genereerTokens(user: UserEntity): AuthResponseDto {
    const payload = { sub: user.id, email: user.email, naam: user.naam, rollen: user.rollen };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
        expiresIn: '30d',
      }),
      gebruiker: {
        id: user.id,
        email: user.email,
        naam: user.naam,
        rollen: user.rollen,
      },
    };
  }
}
