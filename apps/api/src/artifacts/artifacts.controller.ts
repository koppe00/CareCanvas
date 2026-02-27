import { Controller, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ArtifactsService } from './artifacts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('artifacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('artifacts')
export class ArtifactsController {
  constructor(private readonly artifactsService: ArtifactsService) {}

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Haal alle artefacten op voor een project' })
  vindVoorProject(@Param('projectId') projectId: string) {
    return this.artifactsService.vindVoorProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Haal een artefact op op ID' })
  vindOpId(@Param('id') id: string) {
    return this.artifactsService.vindOpId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Werk een artefact bij' })
  bijwerken(@Param('id') id: string, @Body() body: any) {
    return this.artifactsService.bijwerken(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Verwijder een artefact' })
  verwijder(@Param('id') id: string) {
    return this.artifactsService.verwijder(id);
  }
}
