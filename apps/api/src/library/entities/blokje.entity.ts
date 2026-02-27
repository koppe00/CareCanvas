import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('blokjes')
export class BlokjeEntity extends BaseEntity {
  @Column()
  naam: string;

  @Column({ type: 'text' })
  beschrijving: string;

  @Column()
  categorie: string;

  @Column({ type: 'simple-array', default: '' })
  zorgDomeinen: string[];

  @Column({ type: 'jsonb' })
  inhoud: object;

  @Column()
  type: string;

  @Column({ default: '1.0.0' })
  versie: string;

  @Column()
  aangemaaktDoor: string;

  @Column({ type: 'simple-array', default: '' })
  stempels: string[];

  @Column({ default: 'NIET_GESCAND' })
  complianceStatus: string;

  @Column({ nullable: true })
  afkomstigVan: string;

  @Column({ type: 'int', default: 0 })
  gebruiken: number;

  @Column({ type: 'simple-array', default: '' })
  tags: string[];

  @Column({ default: false })
  isPubliek: boolean;

  @Column({ default: 'CC-BY-SA' })
  licentie: string;
}
