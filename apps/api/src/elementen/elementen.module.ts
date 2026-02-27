import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElementenController } from './elementen.controller';
import { ElementenService } from './elementen.service';
import { ElementEntity } from './entities/element.entity';
import { DiscussieBerichtEntity } from './entities/discussie-bericht.entity';
import { StemEntity } from './entities/stem.entity';
import { SignaalEntity } from './entities/signaal.entity';
import { ElementRelatieEntity } from './entities/element-relatie.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ElementEntity,
      DiscussieBerichtEntity,
      StemEntity,
      SignaalEntity,
      ElementRelatieEntity,
    ]),
  ],
  controllers: [ElementenController],
  providers: [ElementenService],
  exports: [ElementenService],
})
export class ElementenModule {}
