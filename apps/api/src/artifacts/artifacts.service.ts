import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArtifactEntity, ArtifactType } from './entities/artifact.entity';

@Injectable()
export class ArtifactsService {
  constructor(
    @InjectRepository(ArtifactEntity)
    private readonly artifactRepo: Repository<ArtifactEntity>,
  ) {}

  async maakArtefact(data: {
    projectId: string;
    type: ArtifactType;
    titel: string;
    inhoud: object;
    aangemaaktDoor: string;
    metadata?: object;
  }): Promise<ArtifactEntity> {
    const artifact = this.artifactRepo.create(data);
    return this.artifactRepo.save(artifact);
  }

  async vindVoorProject(projectId: string): Promise<ArtifactEntity[]> {
    return this.artifactRepo.find({
      where: { projectId },
      order: { aangemaaktOp: 'DESC' },
    });
  }

  async vindOpId(id: string): Promise<ArtifactEntity> {
    const artifact = await this.artifactRepo.findOne({ where: { id } });
    if (!artifact) throw new NotFoundException(`Artefact ${id} niet gevonden`);
    return artifact;
  }

  async bijwerken(id: string, updates: Partial<ArtifactEntity>): Promise<ArtifactEntity> {
    await this.artifactRepo.update(id, updates);
    return this.vindOpId(id);
  }

  async verwijder(id: string): Promise<void> {
    const artifact = await this.vindOpId(id);
    await this.artifactRepo.remove(artifact);
  }
}
