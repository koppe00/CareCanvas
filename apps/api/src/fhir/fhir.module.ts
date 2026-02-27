import { Module } from '@nestjs/common';
import { FhirController } from './fhir.controller';
import { ArtifactsModule } from '../artifacts/artifacts.module';

@Module({
  imports: [ArtifactsModule],
  controllers: [FhirController],
})
export class FhirModule {}
