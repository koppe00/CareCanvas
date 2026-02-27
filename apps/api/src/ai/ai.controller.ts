import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

class SparringDto {
  @ApiProperty()
  @IsString()
  nieuweVraag: string;

  @ApiProperty()
  @IsArray()
  gesprekGeschiedenis: { rol: string; inhoud: string }[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectContext?: string;
}

class SpecGeneratorDto {
  @ApiProperty()
  @IsString()
  probleemFormulering: string;

  @ApiProperty()
  @IsString()
  context: string;
}

class ComplianceDto {
  @ApiProperty()
  @IsString()
  projectBeschrijving: string;
}

class ClassificeerDto {
  @ApiProperty()
  @IsString()
  tekst: string;
}

class DocumentNaarElementenDto {
  @ApiProperty()
  @IsString()
  document: string;
}

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('sparring')
  @ApiOperation({ summary: 'Stuur een bericht naar de Sparring-Partner AI' })
  sparring(@Body() dto: SparringDto) {
    return this.aiService.sparringPartner(dto);
  }

  @Post('specs')
  @ApiOperation({ summary: 'Genereer specificaties op basis van een probleemformulering' })
  genereerSpecs(@Body() dto: SpecGeneratorDto) {
    return this.aiService.genereerSpecificaties(dto.probleemFormulering, dto.context);
  }

  @Post('compliance')
  @ApiOperation({ summary: 'Voer een compliance-scan uit op een projectbeschrijving' })
  compliance(@Body() dto: ComplianceDto) {
    return this.aiService.scanCompliance(dto.projectBeschrijving);
  }

  @Post('classificeer')
  @ApiOperation({ summary: 'Classificeer tekst als een element-type (VISIE, PRINCIPE, etc.)' })
  classificeer(@Body() dto: ClassificeerDto) {
    return this.aiService.classificeerElement(dto.tekst);
  }

  @Post('document-naar-elementen')
  @ApiOperation({ summary: 'Extraheer meerdere element-concepten uit een document of FO' })
  documentNaarElementen(@Body() dto: DocumentNaarElementenDto) {
    return this.aiService.extraheerElementenUitDocument(dto.document);
  }

  @Post('afleiden')
  @ApiOperation({ summary: 'Leid elementen af van een bronelement (one-shot, met kandidaatscoring)' })
  afleiden(
    @Body()
    body: {
      bronElement: any;
      doelType: string;
      bestaandeElementen: any[];
    },
  ) {
    return this.aiService.afleidElementen(body.bronElement, body.doelType, body.bestaandeElementen ?? []);
  }
}
