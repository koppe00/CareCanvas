import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElementEntity } from './entities/element.entity';
import { DiscussieBerichtEntity } from './entities/discussie-bericht.entity';
import { StemEntity } from './entities/stem.entity';
import { SignaalEntity } from './entities/signaal.entity';
import { ElementRelatieEntity } from './entities/element-relatie.entity';
import {
  MaakElementDto,
  WijzigElementStatusDto,
  VoegBerichtToeDto,
  BrengtStemUitDto,
  WijzigElementDto,
} from './dto/element.dto';
const ELEMENT_WORKFLOW: Record<string, string[]> = {
  VISIE: ['CONCEPT', 'IN_DISCUSSIE', 'TER_VASTSTELLING', 'VASTGESTELD'],
  PRINCIPE: ['CONCEPT', 'IN_DISCUSSIE', 'TER_VASTSTELLING', 'VASTGESTELD'],
  EPIC: ['CONCEPT', 'IN_UITWERKING', 'IN_REVIEW', 'GEPUBLICEERD'],
  MODULE: ['CONCEPT', 'IN_UITWERKING', 'IN_REVIEW', 'GEPUBLICEERD'],
  FUNCTIONALITEIT: ['CONCEPT', 'SPECIFICATIE', 'COMPLIANCE', 'VERFIJND', 'GEREED'],
  FUNCTIONEEL_ONTWERP: ['CONCEPT', 'SPECIFICATIE', 'COMPLIANCE', 'VERFIJND', 'GEREED'],
  TECHNISCH_ONTWERP: ['CONCEPT', 'SPECIFICATIE', 'COMPLIANCE', 'VERFIJND', 'GEREED'],
  USER_STORY: ['CONCEPT', 'IN_UITWERKING', 'IN_REVIEW', 'GOEDGEKEURD'],
  API_CONTRACT: ['CONCEPT', 'IN_UITWERKING', 'IN_REVIEW', 'GOEDGEKEURD'],
  DATAMODEL: ['CONCEPT', 'IN_UITWERKING', 'IN_REVIEW', 'GOEDGEKEURD'],
};

const GOEDGEKEURDE_STATUSSEN = ['VASTGESTELD', 'GEPUBLICEERD', 'GOEDGEKEURD', 'GEREED'];

@Injectable()
export class ElementenService {
  constructor(
    @InjectRepository(ElementEntity)
    private readonly elementRepo: Repository<ElementEntity>,
    @InjectRepository(DiscussieBerichtEntity)
    private readonly berichtRepo: Repository<DiscussieBerichtEntity>,
    @InjectRepository(StemEntity)
    private readonly stemRepo: Repository<StemEntity>,
    @InjectRepository(SignaalEntity)
    private readonly signaalRepo: Repository<SignaalEntity>,
    @InjectRepository(ElementRelatieEntity)
    private readonly relatieRepo: Repository<ElementRelatieEntity>,
  ) {}

  async maakElement(dto: MaakElementDto, eigenaarId: string): Promise<ElementEntity> {
    const element = this.elementRepo.create({ ...dto, eigenaarId, status: 'CONCEPT' });
    return this.elementRepo.save(element);
  }

  async vindAlle(params: { type?: string; status?: string; zoekterm?: string }) {
    const { type, status, zoekterm } = params;
    const qb = this.elementRepo.createQueryBuilder('element');
    if (type) qb.andWhere('element.type = :type', { type });
    if (status) qb.andWhere('element.status = :status', { status });
    if (zoekterm) {
      qb.andWhere('(element.titel ILIKE :zoekterm OR element.inhoud ILIKE :zoekterm)', {
        zoekterm: `%${zoekterm}%`,
      });
    }
    qb.orderBy('element.aangemaaktOp', 'DESC');
    const data = await qb.getMany();
    return { data, totaal: data.length };
  }

  async vindOpId(id: string): Promise<ElementEntity> {
    const element = await this.elementRepo.findOne({ where: { id } });
    if (!element) throw new NotFoundException(`Element ${id} niet gevonden`);
    return element;
  }

  async vindGoedgekeurd(): Promise<ElementEntity[]> {
    return this.elementRepo
      .createQueryBuilder('element')
      .where('element.status IN (:...statussen)', { statussen: GOEDGEKEURDE_STATUSSEN })
      .orderBy('element.type', 'ASC')
      .addOrderBy('element.titel', 'ASC')
      .getMany();
  }

  async wijzigStatus(
    id: string,
    dto: WijzigElementStatusDto,
    gebruiker: { sub: string; rollen: string[] },
  ): Promise<ElementEntity> {
    const element = await this.vindOpId(id);
    const workflow = ELEMENT_WORKFLOW[element.type as keyof typeof ELEMENT_WORKFLOW];

    if (!workflow) {
      throw new BadRequestException(`Onbekend element type: ${element.type}`);
    }

    const huidigIndex = workflow.indexOf(element.status as any);
    const nieuwIndex = workflow.indexOf(dto.status as any);

    if (nieuwIndex === -1) {
      throw new BadRequestException(`Status ${dto.status} is niet geldig voor type ${element.type}`);
    }
    if (nieuwIndex !== huidigIndex + 1 && nieuwIndex !== huidigIndex - 1) {
      throw new BadRequestException(
        `Ongeldige statusovergang van ${element.status} naar ${dto.status}`,
      );
    }

    const isBeheerder = gebruiker.rollen.includes('BEHEERDER');
    const isEigenaar = element.eigenaarId === gebruiker.sub;
    const isPrivileged = isBeheerder || gebruiker.rollen.includes('VALIDATOR') || gebruiker.rollen.includes('ARCHITECT') || isEigenaar;

    if (dto.status === 'VASTGESTELD' && !isBeheerder) {
      throw new ForbiddenException('Alleen beheerders kunnen dit element vaststellen');
    }
    if (dto.status === 'TER_VASTSTELLING' && !isPrivileged) {
      throw new ForbiddenException('Alleen de indiener, een architect, validator of beheerder kan dit element ter vaststelling indienen');
    }

    element.status = dto.status;
    const opgeslagen = await this.elementRepo.save(element);

    if (dto.status === 'VASTGESTELD') {
      await this.genereeerSignalen(opgeslagen);
    }

    return opgeslagen;
  }

  async verwijderElement(id: string, gebruiker: { id: string; rollen: string[] }): Promise<void> {
    const element = await this.vindOpId(id);
    const isBeheerder = gebruiker.rollen.includes('BEHEERDER');
    if (element.eigenaarId !== gebruiker.id && !isBeheerder) {
      throw new ForbiddenException('Alleen de eigenaar of een beheerder kan dit element verwijderen');
    }
    const VERWIJDERBAAR = ['CONCEPT', 'SPECIFICATIE'];
    if (!VERWIJDERBAAR.includes(element.status) && !isBeheerder) {
      throw new ForbiddenException(
        `Element in status '${element.status}' kan niet verwijderd worden. Zet het terug naar CONCEPT of vraag een beheerder.`,
      );
    }
    // Verwijder gekoppelde relaties (geen cascade op entity ingesteld)
    await this.relatieRepo.delete({ vanElementId: id });
    await this.relatieRepo.delete({ naarElementId: id });
    await this.elementRepo.delete(id);
  }

  async bijwerken(
    id: string,
    dto: WijzigElementDto,
    gebruikerId: string,
  ): Promise<ElementEntity> {
    const element = await this.vindOpId(id);
    if (element.eigenaarId !== gebruikerId) throw new ForbiddenException('Geen toegang');
    const NIET_BEWERKBAAR = ['IN_DISCUSSIE', 'COMPLIANCE', 'IN_REVIEW', 'TER_VASTSTELLING',
                             'VASTGESTELD', 'GEPUBLICEERD', 'GOEDGEKEURD', 'GEREED'];
    if (NIET_BEWERKBAAR.includes(element.status)) {
      throw new ForbiddenException(`Element kan niet bewerkt worden in status '${element.status}'`);
    }
    Object.assign(element, dto);
    element.versie = element.versie + 1;
    return this.elementRepo.save(element);
  }

  async voegBerichtToe(
    elementId: string,
    dto: VoegBerichtToeDto,
    auteurId: string,
    rol: string,
    auteurNaam?: string,
  ): Promise<DiscussieBerichtEntity> {
    await this.vindOpId(elementId);
    const bericht = this.berichtRepo.create({ elementId, auteurId, tekst: dto.tekst, rol, auteurNaam: auteurNaam ?? null });
    return this.berichtRepo.save(bericht);
  }

  async vindBerichten(elementId: string): Promise<DiscussieBerichtEntity[]> {
    await this.vindOpId(elementId);
    return this.berichtRepo.find({
      where: { elementId },
      order: { aangemaaktOp: 'ASC' },
    });
  }

  async brengtStemUit(
    elementId: string,
    dto: BrengtStemUitDto,
    gebruikerId: string,
  ): Promise<StemEntity> {
    await this.vindOpId(elementId);
    let stem = await this.stemRepo.findOne({ where: { elementId, gebruikerId } });
    if (stem) {
      stem.waarde = dto.waarde;
      stem.toelichting = dto.toelichting ?? null;
    } else {
      stem = this.stemRepo.create({ elementId, gebruikerId, ...dto });
    }
    return this.stemRepo.save(stem);
  }

  async vindStemmen(elementId: string) {
    await this.vindOpId(elementId);
    const stemmen = await this.stemRepo.find({ where: { elementId } });
    const voor = stemmen.filter((s) => s.waarde === 'VOOR').length;
    const tegen = stemmen.filter((s) => s.waarde === 'TEGEN').length;
    const onthouding = stemmen.filter((s) => s.waarde === 'ONTHOUDING').length;
    return { stemmen, voor, tegen, onthouding, totaal: stemmen.length };
  }

  async vindSignalen(elementId: string): Promise<SignaalEntity[]> {
    return this.signaalRepo.find({
      where: { elementId, opgelost: false },
      order: { aangemaaktOp: 'DESC' },
    });
  }

  async markeerOpgelost(elementId: string, signaalId: string): Promise<SignaalEntity> {
    const signaal = await this.signaalRepo.findOne({
      where: { id: signaalId, elementId },
    });
    if (!signaal) throw new NotFoundException(`Signaal ${signaalId} niet gevonden`);
    signaal.opgelost = true;
    return this.signaalRepo.save(signaal);
  }

  // ── Relaties ───────────────────────────────────────────────────────────────

  async maakRelatie(
    vanId: string,
    naarId: string,
    relatieType: string,
    auteurId: string,
  ): Promise<ElementRelatieEntity> {
    await this.vindOpId(vanId);
    await this.vindOpId(naarId);
    const bestaand = await this.relatieRepo.findOne({
      where: { vanElementId: vanId, naarElementId: naarId },
    });
    if (bestaand) {
      // update relatietype als het veranderd is
      bestaand.relatieType = relatieType;
      return this.relatieRepo.save(bestaand);
    }
    try {
      const relatie = this.relatieRepo.create({ vanElementId: vanId, naarElementId: naarId, relatieType, aangemaaktDoor: auteurId });
      return await this.relatieRepo.save(relatie);
    } catch {
      throw new ConflictException('Relatie bestaat al');
    }
  }

  async vindRelaties(elementId: string): Promise<{ uitgaand: ElementRelatieEntity[]; inkomend: ElementRelatieEntity[] }> {
    const [uitgaand, inkomend] = await Promise.all([
      this.relatieRepo.find({ where: { vanElementId: elementId }, order: { aangemaaktOp: 'ASC' } }),
      this.relatieRepo.find({ where: { naarElementId: elementId }, order: { aangemaaktOp: 'ASC' } }),
    ]);
    return { uitgaand, inkomend };
  }

  async vindAlleRelaties(): Promise<ElementRelatieEntity[]> {
    return this.relatieRepo.find({ order: { aangemaaktOp: 'ASC' } });
  }

  async verwijderRelatie(relatieId: string, gebruiker: { id: string; rollen: string[] }): Promise<void> {
    const relatie = await this.relatieRepo.findOne({ where: { id: relatieId } });
    if (!relatie) throw new NotFoundException(`Relatie ${relatieId} niet gevonden`);
    const isBeheerder = gebruiker.rollen.includes('BEHEERDER');
    if (relatie.aangemaaktDoor !== gebruiker.id && !isBeheerder) {
      throw new ForbiddenException('Alleen de aanmaker of een beheerder kan een relatie verwijderen');
    }
    await this.relatieRepo.delete(relatieId);
  }

  private async genereeerSignalen(bronElement: ElementEntity): Promise<void> {
    if (!bronElement?.id) return;
    const gekoppelde = await this.elementRepo
      .createQueryBuilder('element')
      .where(
        "element.gekoppeldAan IS NOT NULL AND element.gekoppeldAan != '' AND element.gekoppeldAan LIKE :bronId",
        { bronId: `%${bronElement.id}%` },
      )
      .getMany();

    for (const el of gekoppelde) {
      const signaal = this.signaalRepo.create({
        elementId: el.id,
        bronElementId: bronElement.id,
        type: 'CONSISTENTIE_CHECK',
        boodschap: `De ${bronElement.type} "${bronElement.titel}" is vastgesteld of bijgewerkt. Controleer of dit element nog consistent is.`,
        opgelost: false,
      });
      await this.signaalRepo.save(signaal);
    }
  }
}
