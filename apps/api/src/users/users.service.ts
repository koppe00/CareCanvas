import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async vindAlle(pagination: PaginationDto) {
    const { pagina = 1, limiet = 20 } = pagination;
    const [data, totaal] = await this.userRepo.findAndCount({
      skip: (pagina - 1) * limiet,
      take: limiet,
      where: { actief: true },
    });
    return { data, totaal, pagina, limiet, totaalPaginas: Math.ceil(totaal / limiet) };
  }

  async vindOpId(id: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Gebruiker ${id} niet gevonden`);
    return user;
  }

  async bijwerken(id: string, updates: Partial<UserEntity>): Promise<UserEntity> {
    await this.userRepo.update(id, updates);
    return this.vindOpId(id);
  }

  async vindOpRol(rol: string): Promise<UserEntity[]> {
    return this.userRepo
      .createQueryBuilder('user')
      .where('user.rollen LIKE :rol', { rol: `%${rol}%` })
      .andWhere('user.actief = true')
      .getMany();
  }
}
