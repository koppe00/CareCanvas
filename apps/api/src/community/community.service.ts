import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StempelEntity } from './entities/stempel.entity';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(StempelEntity)
    private readonly stempelRepo: Repository<StempelEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async geefStempel(data: {
    type: string;
    artefactId: string;
    projectId: string;
    afgegevenDoor: string;
    opmerking?: string;
  }): Promise<StempelEntity> {
    const stempel = this.stempelRepo.create(data);
    return this.stempelRepo.save(stempel);
  }

  async vindStempelsVoorProject(projectId: string): Promise<StempelEntity[]> {
    return this.stempelRepo.find({ where: { projectId } });
  }

  async vindExpertsVoorRol(rol: string): Promise<UserEntity[]> {
    return this.userRepo
      .createQueryBuilder('user')
      .where('user.rollen LIKE :rol', { rol: `%${rol}%` })
      .andWhere('user.actief = true')
      .orderBy('user.vertrouwensScore', 'DESC')
      .take(20)
      .getMany();
  }

  async matchRollen(zorgDomein: string, benodegdeRollen: string[]): Promise<UserEntity[]> {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .where('user.actief = true');
    if (zorgDomein) {
      qb.andWhere('user.zorgDomeinen LIKE :domein', { domein: `%${zorgDomein}%` });
    }
    return qb.orderBy('user.vertrouwensScore', 'DESC').take(10).getMany();
  }
}
