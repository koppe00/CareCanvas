import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum ProjectStatus {
  IDEE = 'IDEE',
  VERDIEPING = 'VERDIEPING',
  SPECIFICATIE = 'SPECIFICATIE',
  REVIEW = 'REVIEW',
  COMPLIANCE = 'COMPLIANCE',
  GEPUBLICEERD = 'GEPUBLICEERD',
  GEARCHIVEERD = 'GEARCHIVEERD',
}

export enum ComplianceStatus {
  NIET_GESCAND = 'NIET_GESCAND',
  GROEN = 'GROEN',
  ORANJE = 'ORANJE',
  ROOD = 'ROOD',
}

@Entity('projects')
export class ProjectEntity extends BaseEntity {
  @Column()
  titel: string;

  @Column({ type: 'text' })
  beschrijving: string;

  @Column()
  zorgDomein: string;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.IDEE })
  status: ProjectStatus;

  @Column()
  eigenaarId: string;

  @Column({ type: 'jsonb', default: '[]' })
  deelnemers: object[];

  @Column({ type: 'enum', enum: ComplianceStatus, default: ComplianceStatus.NIET_GESCAND })
  complianceStatus: ComplianceStatus;

  @Column({ default: '1.0.0' })
  versie: string;

  @Column({ type: 'simple-array', default: '' })
  tags: string[];

  @Column({ default: false })
  isPubliek: boolean;

  @Column({ nullable: true })
  gebasseerdOp: string;

  @Column({ nullable: true })
  gepubliceerdOp: Date;
}
