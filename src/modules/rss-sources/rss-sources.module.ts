import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RssSourceSchema } from './data/schemas/rss-source.schema';
import { RssSourcesController } from './controllers/rss-sources.controller';
import { RssSourcesService } from './business/services/rss-sources.service';
import { RssSourceRepository } from './data/repositories/rss-source.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RssSourceSchema,
    ]),
  ],
  controllers: [
    RssSourcesController,
  ],
  providers: [
    RssSourcesService,
    RssSourceRepository,
  ],
  exports: [
    RssSourcesService,
    RssSourceRepository,
  ],
})
export class RssSourcesModule {}
