import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ElementenService } from './elementen.service';
import {
  MaakElementDto,
  WijzigElementStatusDto,
  VoegBerichtToeDto,
  BrengtStemUitDto,
  WijzigElementDto,
} from './dto/element.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('elementen')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('elementen')
export class ElementenController {
  constructor(private readonly elementenService: ElementenService) {}

  // BELANGRIJK: /goedgekeurd vóór /:id declareren
  @Get('goedgekeurd')
  @ApiOperation({ summary: 'Haal alle vastgestelde / gepubliceerde elementen op (Systeem Canvas)' })
  vindGoedgekeurd() {
    return this.elementenService.vindGoedgekeurd();
  }

  @Get()
  @ApiOperation({ summary: 'Haal alle elementen op (met optionele filters)' })
  vindAlle(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('zoekterm') zoekterm?: string,
  ) {
    return this.elementenService.vindAlle({ type, status, zoekterm });
  }

  @Post()
  @ApiOperation({ summary: 'Maak een nieuw element aan' })
  maakElement(@Body() dto: MaakElementDto, @CurrentUser() user: any) {
    return this.elementenService.maakElement(dto, user.id);
  }

  // BELANGRIJK: /alle-relaties vóór /:id declareren
  @Get('alle-relaties')
  @ApiOperation({ summary: 'Haal alle element-relaties op (voor Canvas)' })
  vindAlleRelaties() {
    return this.elementenService.vindAlleRelaties();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Haal een element op op ID' })
  vindOpId(@Param('id') id: string) {
    return this.elementenService.vindOpId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Werk een element bij' })
  bijwerken(@Param('id') id: string, @Body() dto: WijzigElementDto, @CurrentUser() user: any) {
    return this.elementenService.bijwerken(id, dto, user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Wijzig de status van een element (workflow stap)' })
  wijzigStatus(
    @Param('id') id: string,
    @Body() dto: WijzigElementStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.elementenService.wijzigStatus(id, dto, {
      sub: user.id,
      rollen: user.rollen ?? [],
    });
  }

  @Get(':id/relaties')
  @ApiOperation({ summary: 'Haal relaties op voor een element (uitgaand + inkomend)' })
  vindRelaties(@Param('id') id: string) {
    return this.elementenService.vindRelaties(id);
  }

  @Post(':id/relaties')
  @ApiOperation({ summary: 'Leg een relatie vast vanuit dit element naar een ander element' })
  maakRelatie(
    @Param('id') id: string,
    @Body() body: { naarElementId: string; relatieType: string },
    @CurrentUser() user: any,
  ) {
    return this.elementenService.maakRelatie(id, body.naarElementId, body.relatieType, user.id);
  }

  @Delete(':id/relaties/:relatieId')
  @ApiOperation({ summary: 'Verwijder een relatie' })
  verwijderRelatie(
    @Param('id') _id: string,
    @Param('relatieId') relatieId: string,
    @CurrentUser() user: any,
  ) {
    return this.elementenService.verwijderRelatie(relatieId, { id: user.id, rollen: user.rollen ?? [] });
  }

  @Get(':id/berichten')
  @ApiOperation({ summary: 'Haal discussieberichten op voor een element' })
  vindBerichten(@Param('id') id: string) {
    return this.elementenService.vindBerichten(id);
  }

  @Post(':id/berichten')
  @ApiOperation({ summary: 'Voeg een discussiebericht toe aan een element' })
  voegBerichtToe(
    @Param('id') id: string,
    @Body() dto: VoegBerichtToeDto,
    @CurrentUser() user: any,
  ) {
    const rol = user.rollen?.[0] ?? 'GEBRUIKER';
    return this.elementenService.voegBerichtToe(id, dto, user.id, rol, user.naam);
  }

  @Get(':id/stemmen')
  @ApiOperation({ summary: 'Haal stemoverzicht op voor een element' })
  vindStemmen(@Param('id') id: string) {
    return this.elementenService.vindStemmen(id);
  }

  @Post(':id/stemmen')
  @ApiOperation({ summary: 'Breng een stem uit op een element' })
  brengtStemUit(
    @Param('id') id: string,
    @Body() dto: BrengtStemUitDto,
    @CurrentUser() user: any,
  ) {
    return this.elementenService.brengtStemUit(id, dto, user.id);
  }

  @Get(':id/signalen')
  @ApiOperation({ summary: 'Haal open consistentiesignalen op voor een element' })
  vindSignalen(@Param('id') id: string) {
    return this.elementenService.vindSignalen(id);
  }

  @Patch(':id/signalen/:signaalId/opgelost')
  @ApiOperation({ summary: 'Markeer een signaal als opgelost' })
  markeerOpgelost(@Param('id') id: string, @Param('signaalId') signaalId: string) {
    return this.elementenService.markeerOpgelost(id, signaalId);
  }
}
