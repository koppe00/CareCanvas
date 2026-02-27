import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LibraryService } from './library.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('library')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  @ApiOperation({ summary: 'Doorzoek de Open-Source Bibliotheek' })
  vindAlle(
    @Query() pagination: PaginationDto,
    @Query('zoekterm') zoekterm?: string,
    @Query('categorie') categorie?: string,
  ) {
    return this.libraryService.vindAlle(pagination, { zoekterm, categorie });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Haal een blokje op op ID' })
  vindOpId(@Param('id') id: string) {
    return this.libraryService.vindOpId(id);
  }

  @Post()
  @ApiOperation({ summary: 'Voeg een nieuw blokje toe aan de bibliotheek' })
  maakBlokje(@Body() body: any, @CurrentUser() user: any) {
    return this.libraryService.maakBlokje(body, user.id);
  }

  @Post(':id/fork')
  @ApiOperation({ summary: 'Fork een bestaand blokje voor eigen gebruik' })
  fork(@Param('id') id: string, @CurrentUser() user: any) {
    return this.libraryService.forkBlokje(id, user.id);
  }
}
