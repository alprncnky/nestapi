import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedSchema } from './data/schemas/feed.schema';
import { FeedController } from './controllers/feed.controller';
import { FeedService } from './business/services/feed.service';
import { RssFetcherService } from './business/services/rss-fetcher.service';
import { FeedRepository } from './data/repositories/feed.repository';
import { FeedFetchSchedule } from './business/orchestration/schedules/feed-fetch.schedule';
import { BaseSchedulerService } from '../../common/services/base-scheduler.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeedSchema])],
  controllers: [FeedController],
  providers: [FeedService, RssFetcherService, FeedRepository, FeedFetchSchedule],
  exports: [FeedService, RssFetcherService, FeedRepository],
})
export class FeedModule implements OnModuleInit {
  constructor(private readonly baseScheduler: BaseSchedulerService, private readonly feedFetchSchedule: FeedFetchSchedule) {}

  async onModuleInit() {
    this.baseScheduler.registerTask(this.feedFetchSchedule);
  }
}

