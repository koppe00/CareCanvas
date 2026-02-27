import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('stempels')
export class StempelEntity extends BaseEntity {
  @Column()
  type: string;

  @Column()
  artefactId: string;

  @Column()
  projectId: string;

  @Column()
  afgegevenDoor: string;

  @Column({ type: 'text', nullable: true })
  opmerking: string;

  @Column({ default: true })
  geldig: boolean;
}
