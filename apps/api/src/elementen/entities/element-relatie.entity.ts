import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

/**
 * Richting-conventie:
 *   vanElementId = het kind/afgeleide element
 *   naarElementId = het ouder/bronelement
 *
 * Voorbeeld: EPIC afgeleid van VISIE →
 *   { vanElementId: epic.id, naarElementId: visie.id, relatieType: 'AFGELEID_VAN' }
 */
@Entity('element_relaties')
@Unique(['vanElementId', 'naarElementId'])
export class ElementRelatieEntity extends BaseEntity {
  @Column()
  vanElementId: string;

  @Column()
  naarElementId: string;

  @Column()
  relatieType: string; // RelatieType: AFGELEID_VAN | IMPLEMENTEERT | VERWIJST_NAAR

  @Column()
  aangemaaktDoor: string; // userId
}
