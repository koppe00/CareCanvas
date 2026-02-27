import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('elementen')
export class ElementEntity extends BaseEntity {
  @Column()
  type: string;

  @Column({ default: 'CONCEPT' })
  status: string;

  @Column()
  titel: string;

  @Column({ type: 'text' })
  inhoud: string;

  @Column({ type: 'text', nullable: true })
  toelichting: string;

  @Column()
  eigenaarId: string;

  @Column({ type: 'simple-array', nullable: true })
  gekoppeldAan: string[];

  @Column({ type: 'int', default: 1 })
  versie: number;
}
