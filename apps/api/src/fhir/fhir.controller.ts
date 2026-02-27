import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ArtifactsService } from '../artifacts/artifacts.service';

@ApiTags('fhir')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fhir')
export class FhirController {
  constructor(private readonly artifactsService: ArtifactsService) {}

  @Get('export/:projectId')
  @ApiOperation({ summary: 'Exporteer een project als FHIR R4 Bundle' })
  async exportFhir(@Param('projectId') projectId: string, @Res() res: Response) {
    const artefacts = await this.artifactsService.vindVoorProject(projectId);

    const bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      id: `carecanvas-export-${projectId}`,
      timestamp: new Date().toISOString(),
      meta: {
        tag: [{ system: 'https://carecanvas.nl/tags', code: 'carecanvas-export' }],
      },
      entry: artefacts.map((a) => ({
        resource: {
          resourceType: 'Basic',
          id: a.id,
          code: {
            coding: [
              { system: 'https://carecanvas.nl/artifact-types', code: a.type },
            ],
          },
          subject: { reference: `Project/${projectId}` },
          extension: [
            {
              url: 'https://carecanvas.nl/extensions/titel',
              valueString: a.titel,
            },
            {
              url: 'https://carecanvas.nl/extensions/inhoud',
              valueString: JSON.stringify(a.inhoud),
            },
          ],
        },
      })),
    };

    res.setHeader('Content-Type', 'application/fhir+json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="carecanvas-${projectId}.json"`,
    );
    return res.json(bundle);
  }
}
