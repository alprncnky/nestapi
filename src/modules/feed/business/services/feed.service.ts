import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Feed } from '../../data/entities/feed.entity';
import { SaveFeedDto } from '../../contracts/requests/save-feed.dto';
import { FeedRepository } from '../../data/repositories/feed.repository';
import { RssFetcherService } from './rss-fetcher.service';
import { FeedTypeEnum } from '../../contracts/enums/feed-type.enum';

interface RssSourceConfig {
  url: string;
  source: string;
  feedType: FeedTypeEnum;
}

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(private readonly feedRepository: FeedRepository, private readonly rssFetcherService: RssFetcherService) {}

  async save(saveFeedDto: SaveFeedDto): Promise<Feed> {
    const id = saveFeedDto.id;

    if (id) {
      const feed = await this.feedRepository.findById(id);
      if (!feed) {
        throw new NotFoundException(`Feed with ID ${id} not found`);
      }
      Object.assign(feed, { ...saveFeedDto, updatedAt: new Date() });
      return await this.feedRepository.save(feed);
    } else {
      const feed = new Feed();
      Object.assign(feed, {...saveFeedDto, fetchedAt: new Date(), createdAt: new Date(), updatedAt: new Date()});
      return await this.feedRepository.save(feed);
    }
  }

  async remove(id: number): Promise<void> {
    const feed = await this.feedRepository.findById(id);
    if (!feed) {
      throw new NotFoundException(`Feed with ID ${id} not found`);
    }
    await this.feedRepository.remove(feed);
  }

  async jobExecute(): Promise<{ saved: number; skipped: number; errors: number }> {
    this.logger.log('Starting feed job execution...');
    let savedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const rssSources = this.getRssSources();
    for (const rssSource of rssSources) {
      const result = await this.processFeedSource(rssSource);
      savedCount += result.saved;
      skippedCount += result.skipped;
      errorCount += result.errors;
    }
    this.logger.log(`Feed job completed. Saved: ${savedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);
    return { saved: savedCount, skipped: skippedCount, errors: errorCount };
  }

  private async processFeedSource(rssSource: RssSourceConfig): Promise<{ saved: number; skipped: number; errors: number }> {
    let saved = 0;
    let skipped = 0;
    let errors = 0;
    try {
      const items = await this.rssFetcherService.fetchRssFeed(rssSource.url);
      for (const item of items) {
        const result = await this.processFeedItem(item, rssSource);
        if (result === 'saved') saved++;
        else if (result === 'skipped') skipped++;
        else if (result === 'error') errors++;
      }
    } catch (error) {
      this.logger.error(`Failed to fetch from ${rssSource.source}: ${error.message}`, error.stack);
      errors++;
    }
    return { saved, skipped, errors };
  }

  private async processFeedItem(item: any, rssSource: RssSourceConfig): Promise<'saved' | 'skipped' | 'error'> {
    try {
      const existingFeed = await this.feedRepository.findByUrl(item.link || '');
      if (existingFeed) {
        return 'skipped';
      }
      await this.saveFeedItem(item, rssSource);
      return 'saved';
    } catch (error) {
      this.logger.error(`Failed to process feed item: ${error.message}`, error.stack);
      return 'error';
    }
  }

  private async saveFeedItem(item: any, rssSource: RssSourceConfig): Promise<void> {
    const content = this.rssFetcherService.getItemContent(item);
    const plainText = this.rssFetcherService.extractPlainText(content);
    const feed = new Feed();
    Object.assign(feed, {url: item.link || '', title: item.title || '', text: plainText || content, source: rssSource.source, feedType: rssSource.feedType, fetchedAt: new Date(), createdAt: new Date(), updatedAt: new Date()});
    await this.feedRepository.save(feed);
  }

  private getRssSources(): RssSourceConfig[] {
    return [
      {url: 'https://www.borsagundem.com.tr/rss/sirket-haberleri', source: 'Borsa Gündem', feedType: FeedTypeEnum.NEWS},
    ];
  }
}

