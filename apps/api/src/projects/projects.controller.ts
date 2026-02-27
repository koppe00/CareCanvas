import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { MaakProjectDto, WijzigProjectStatusDto } from './dto/project.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Maak een nieuw project aan' })
  maakProject(@Body() dto: MaakProjectDto, @CurrentUser() user: any) {
    return this.projectsService.maakProject(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Haal alle projecten op' })
  vindAlle(@Query() pagination: PaginationDto, @Query('eigenaarId') eigenaarId?: string) {
    return this.projectsService.vindAlle(pagination, eigenaarId);
  }

  @Get('mijn')
  @ApiOperation({ summary: 'Haal eigen projecten op' })
  mijnProjecten(@Query() pagination: PaginationDto, @CurrentUser() user: any) {
    return this.projectsService.vindAlle(pagination, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Haal een project op op ID' })
  vindOpId(@Param('id') id: string) {
    return this.projectsService.vindOpId(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Wijzig de status van een project' })
  wijzigStatus(
    @Param('id') id: string,
    @Body() dto: WijzigProjectStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.wijzigStatus(id, dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Werk een project bij' })
  bijwerken(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    return this.projectsService.bijwerken(id, body, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Verwijder een project' })
  verwijder(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.verwijder(id, user.id);
  }
}
