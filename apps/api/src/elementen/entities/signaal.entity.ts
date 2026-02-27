import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('signalen')
export class SignaalEntity extends BaseEntity {
  @Column()
  elementId: string;

  @Column()
  bronElementId: string;

  @Column()
  type: string;

  @Column({ type: 'text' })
  boodschap: string;

  @Column({ default: false })
  opgelost: boolean;
}
