import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum ArtifactType {
  USER_STORY = 'USER_STORY',
  DATAMODEL = 'DATAMODEL',
  STROOMSCHEMA = 'STROOMSCHEMA',
  API_CONTRACT = 'API_CONTRACT',
  COMPLIANCE_RAPPORT = 'COMPLIANCE_RAPPORT',
  BLUEPRINT = 'BLUEPRINT',
  CANVAS_UPLOAD = 'CANVAS_UPLOAD',
  OCR_OUTPUT = 'OCR_OUTPUT',
}

@Entity('artifacts')
export class ArtifactEntity extends BaseEntity {
  @Column()
  projectId: string;

  @Column({ type: 'enum', enum: ArtifactType })
  type: ArtifactType;

  @Column()
  titel: string;

  @Column({ type: 'jsonb' })
  inhoud: object;

  @Column({ default: '1.0.0' })
  versie: string;

  @Column()
  aangemaaktDoor: string;

  @Column({ nullable: true })
  bestandsUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: object;
}
