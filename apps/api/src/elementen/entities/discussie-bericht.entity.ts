import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('discussie_berichten')
export class DiscussieBerichtEntity extends BaseEntity {
  @Column()
  elementId: string;

  @Column()
  auteurId: string;

  @Column({ type: 'text' })
  tekst: string;

  @Column()
  rol: string;

  @Column({ type: 'varchar', nullable: true })
  auteurNaam: string | null;
}
