import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity, ProjectStatus } from './entities/project.entity';
import { MaakProjectDto, WijzigProjectStatusDto } from './dto/project.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepo: Repository<ProjectEntity>,
  ) {}

  async maakProject(dto: MaakProjectDto, eigenaarId: string): Promise<ProjectEntity> {
    const project = this.projectRepo.create({ ...dto, eigenaarId });
    return this.projectRepo.save(project);
  }

  async vindAlle(pagination: PaginationDto, eigenaarId?: string) {
    const { pagina = 1, limiet = 20 } = pagination;
    const qb = this.projectRepo.createQueryBuilder('project');
    if (eigenaarId) {
      qb.where('project.eigenaarId = :eigenaarId', { eigenaarId });
    }
    qb.skip((pagina - 1) * limiet).take(limiet).orderBy('project.aangemaaktOp', 'DESC');
    const [data, totaal] = await qb.getManyAndCount();
    return { data, totaal, pagina, limiet, totaalPaginas: Math.ceil(totaal / limiet) };
  }

  async vindOpId(id: string): Promise<ProjectEntity> {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException(`Project ${id} niet gevonden`);
    return project;
  }

  async wijzigStatus(id: string, dto: WijzigProjectStatusDto, gebruikerId: string): Promise<ProjectEntity> {
    const project = await this.vindOpId(id);
    if (project.eigenaarId !== gebruikerId) {
      throw new ForbiddenException('Alleen de eigenaar kan de status wijzigen');
    }
    project.status = dto.status;
    if (dto.status === ProjectStatus.GEPUBLICEERD) project.gepubliceerdOp = new Date();
    return this.projectRepo.save(project);
  }

  async bijwerken(id: string, updates: Partial<ProjectEntity>, gebruikerId: string): Promise<ProjectEntity> {
    const project = await this.vindOpId(id);
    if (project.eigenaarId !== gebruikerId) throw new ForbiddenException('Geen toegang');
    Object.assign(project, updates);
    return this.projectRepo.save(project);
  }

  async verwijder(id: string, gebruikerId: string): Promise<void> {
    const project = await this.vindOpId(id);
    if (project.eigenaarId !== gebruikerId) throw new ForbiddenException('Geen toegang');
    await this.projectRepo.remove(project);
  }
}
