import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlokjeEntity } from './entities/blokje.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class LibraryService {
  constructor(
    @InjectRepository(BlokjeEntity)
    private readonly blokjeRepo: Repository<BlokjeEntity>,
  ) {}

  async vindAlle(
    pagination: PaginationDto,
    filter?: { zoekterm?: string; categorie?: string },
  ) {
    const { pagina = 1, limiet = 20 } = pagination;
    const qb = this.blokjeRepo.createQueryBuilder('blokje')
      .where('blokje.isPubliek = true');

    if (filter?.categorie) {
      qb.andWhere('blokje.categorie = :categorie', { categorie: filter.categorie });
    }
    if (filter?.zoekterm) {
      qb.andWhere(
        '(blokje.naam ILIKE :zoekterm OR blokje.beschrijving ILIKE :zoekterm)',
        { zoekterm: `%${filter.zoekterm}%` },
      );
    }

    qb.skip((pagina - 1) * limiet).take(limiet).orderBy('blokje.gebruiken', 'DESC');
    const [data, totaal] = await qb.getManyAndCount();
    return { data, totaal, pagina, limiet, totaalPaginas: Math.ceil(totaal / limiet) };
  }

  async vindOpId(id: string): Promise<BlokjeEntity> {
    const blokje = await this.blokjeRepo.findOne({ where: { id } });
    if (!blokje) throw new NotFoundException(`Blokje ${id} niet gevonden`);
    return blokje;
  }

  async maakBlokje(data: Partial<BlokjeEntity>, gebruikerId: string): Promise<BlokjeEntity> {
    const blokje = this.blokjeRepo.create({ ...data, aangemaaktDoor: gebruikerId });
    return this.blokjeRepo.save(blokje);
  }

  async forkBlokje(id: string, gebruikerId: string): Promise<BlokjeEntity> {
    const origineel = await this.vindOpId(id);
    const fork = this.blokjeRepo.create({
      ...origineel,
      id: undefined as any,
      naam: `${origineel.naam} (fork)`,
      versie: '1.0.0',
      aangemaaktDoor: gebruikerId,
      afkomstigVan: origineel.id,
      stempels: [],
      complianceStatus: 'NIET_GESCAND',
      gebruiken: 0,
      isPubliek: false,
    });
    await this.blokjeRepo.increment({ id }, 'gebruiken', 1);
    return this.blokjeRepo.save(fork);
  }
}
