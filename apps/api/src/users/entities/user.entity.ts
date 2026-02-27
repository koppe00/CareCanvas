import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum UserRole {
  DROMER = 'DROMER',
  GIDS = 'GIDS',
  ARCHITECT = 'ARCHITECT',
  BOUWER = 'BOUWER',
  VALIDATOR = 'VALIDATOR',
  BEHEERDER = 'BEHEERDER',
}

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  naam: string;

  @Column({ select: false })
  wachtwoordHash: string;

  @Column({ type: 'simple-array', default: 'DROMER' })
  rollen: UserRole[];

  @Column({ type: 'simple-array', default: '' })
  zorgDomeinen: string[];

  @Column({ nullable: true })
  bigRegistratie: string;

  @Column({ default: false })
  bigGeverifieerd: boolean;

  @Column({ nullable: true })
  organisatie: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'float', default: 0 })
  vertrouwensScore: number;

  @Column({ default: true })
  actief: boolean;

  @Column({ nullable: true })
  refreshToken: string;
}
