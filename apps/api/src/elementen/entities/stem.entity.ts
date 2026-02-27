import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('stemmen')
@Unique(['elementId', 'gebruikerId'])
export class StemEntity extends BaseEntity {
  @Column()
  elementId: string;

  @Column()
  gebruikerId: string;

  @Column()
  waarde: string;

  @Column({ type: 'text', nullable: true })
  toelichting: string | null;
}
