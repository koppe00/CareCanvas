import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ArtifactsModule } from './artifacts/artifacts.module';
import { AiModule } from './ai/ai.module';
import { LibraryModule } from './library/library.module';
import { CommunityModule } from './community/community.module';
import { FhirModule } from './fhir/fhir.module';
import { ElementenModule } from './elementen/elementen.module';
import { UserEntity } from './users/entities/user.entity';
import { ProjectEntity } from './projects/entities/project.entity';
import { ArtifactEntity } from './artifacts/entities/artifact.entity';
import { BlokjeEntity } from './library/entities/blokje.entity';
import { StempelEntity } from './community/entities/stempel.entity';
import { ElementEntity } from './elementen/entities/element.entity';
import { DiscussieBerichtEntity } from './elementen/entities/discussie-bericht.entity';
import { StemEntity } from './elementen/entities/stem.entity';
import { SignaalEntity } from './elementen/entities/signaal.entity';
import { ElementRelatieEntity } from './elementen/entities/element-relatie.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url:
        process.env.DATABASE_URL ??
        'postgresql://carecanvas:carecanvas_secret@localhost:5433/carecanvas',
      entities: [
        UserEntity,
        ProjectEntity,
        ArtifactEntity,
        BlokjeEntity,
        StempelEntity,
        ElementEntity,
        DiscussieBerichtEntity,
        StemEntity,
        SignaalEntity,
        ElementRelatieEntity,
      ],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UsersModule,
    ProjectsModule,
    ArtifactsModule,
    AiModule,
    LibraryModule,
    CommunityModule,
    FhirModule,
    ElementenModule,
  ],
})
export class AppModule {}
