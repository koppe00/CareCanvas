import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('community')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('stempel')
  @ApiOperation({ summary: 'Geef een validatiestempel af op een artefact' })
  geefStempel(@Body() body: any, @CurrentUser() user: any) {
    return this.communityService.geefStempel({ ...body, afgegevenDoor: user.id });
  }

  @Get('stempels/:projectId')
  @ApiOperation({ summary: 'Haal alle stempels op voor een project' })
  stempelsVoorProject(@Param('projectId') projectId: string) {
    return this.communityService.vindStempelsVoorProject(projectId);
  }

  @Get('experts')
  @ApiOperation({ summary: 'Vind experts op basis van rol' })
  vindExperts(@Query('rol') rol: string) {
    return this.communityService.vindExpertsVoorRol(rol);
  }

  @Post('match')
  @ApiOperation({ summary: 'Koppel rollen aan een project op basis van zorgdomein' })
  matchRollen(@Body() body: { zorgDomein: string; benodegdeRollen: string[] }) {
    return this.communityService.matchRollen(body.zorgDomein, body.benodegdeRollen);
  }
}
