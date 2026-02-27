import { Controller, Get, Param, Patch, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Haal alle actieve gebruikers op' })
  vindAlle(@Query() pagination: PaginationDto) {
    return this.usersService.vindAlle(pagination);
  }

  @Get('profiel')
  @ApiOperation({ summary: 'Haal eigen profiel op' })
  eigenProfiel(@CurrentUser() user: any) {
    return this.usersService.vindOpId(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Haal een gebruiker op op ID' })
  vindOpId(@Param('id') id: string) {
    return this.usersService.vindOpId(id);
  }

  @Patch('profiel')
  @ApiOperation({ summary: 'Werk eigen profiel bij' })
  bijwerken(@CurrentUser() user: any, @Body() body: any) {
    return this.usersService.bijwerken(user.id, body);
  }
}
