import { Injectable, Logger } from '@nestjs/common';
import { RssParserService, ParsedItem } from '../rss-parser.service';
import { NewsService } from '../../news/news.service';
import { RssSource } from '../entities/rss-source.entity';
import { NewsStatusEnum } from '../../news/enums/news-status.enum';
import { compareTwoStrings } from '../../../common/utils/string-similarity.util';

/**
 * RSS Fetch Service - Business Logic ONLY
 * 
 * Responsibilities:
 * - Process RSS feeds and create news articles
 * - Validate articles
 * - Check for duplicates
 * - Apply business rules
 * 
 * NO scheduling concerns here!
 * This service can be called by:
 * - Scheduled tasks
 * - API endpoints (manual trigger)
 * - Background jobs
 */
@Injectable()
export class RssFetchService {
  private readonly logger = new Logger(RssFetchService.name);
  
  // Business rules as constants
  private readonly DUPLICATE_THRESHOLD = 0.85; // 85% similarity = duplicate
  private readonly RECENT_HOURS = 24;           // Check duplicates in last 24 hours

  constructor(
    private readonly rssParserService: RssParserService,
    private readonly newsService: NewsService,
  ) {}

  /**
   * Process a single RSS source
   * Returns statistics about processed articles
   */
  async processFeedSource(source: RssSource): Promise<{
    newArticles: number;
    duplicates: number;
    errors: number;
  }> {
    // 1. Validation
    await this.validateSource(source);

    // 2. Parse RSS feed
    const items = await this.rssParserService.parseFeed(
      source.url,
      source.feedType as any,
    );

    if (items.length === 0) {
      this.logger.warn(`No items found for source: ${source.name}`);
      return { newArticles: 0, duplicates: 0, errors: 0 };
    }

    this.logger.debug(`Found ${items.length} items in feed: ${source.name}`);

    // 3. Process each item
    let newArticles = 0;
    let duplicates = 0;
    let errors = 0;

    for (const item of items) {
      try {
        const isDuplicate = await this.checkDuplicate(item.link, item.title);
        
        if (isDuplicate) {
          duplicates++;
          continue;
        }

        await this.createArticleFromFeedItem(source.id, item);
        newArticles++;
      } catch (error) {
        this.logger.error(
          `Failed to process item "${item.title}": ${error.message}`,
        );
        errors++;
      }
    }

    return { newArticles, duplicates, errors };
  }

  /**
   * Business Logic: Create news article from RSS feed item
   */
  private async createArticleFromFeedItem(
    sourceId: number,
    item: ParsedItem,
  ): Promise<void> {
    await this.newsService.create({
      sourceId,
      title: item.title,
      url: item.link,
      guid: item.guid,
      summary: item.description,
      content: item.content,
      contentPlain: item.contentPlain,
      publishedAt: item.pubDate,
      scrapedAt: new Date(),
      imageUrl: item.imageUrl,
      status: NewsStatusEnum.PENDING,
      isDuplicate: false,
    });

    this.logger.debug(`Created article: "${item.title}"`);
  }

  /**
   * Business Logic: Check if article is duplicate
   * Uses two methods:
   * 1. Exact URL match (fast)
   * 2. Title similarity (slower but catches duplicates from different sources)
   */
  private async checkDuplicate(url: string, title: string): Promise<boolean> {
    // 1. Check by exact URL (fast check)
    const existingByUrl = await this.newsService.findByUrl(url);
    if (existingByUrl) {
      this.logger.debug(`Duplicate found by URL: ${url}`);
      return true;
    }

    // 2. Check by title similarity (last N hours)
    const recentArticles = await this.newsService.findRecentArticles(
      this.RECENT_HOURS,
    );

    for (const article of recentArticles) {
      const similarity = compareTwoStrings(
        title.toLowerCase(),
        article.title.toLowerCase(),
      );

      if (similarity > this.DUPLICATE_THRESHOLD) {
        this.logger.debug(
          `Duplicate found by similarity (${(similarity * 100).toFixed(1)}%): ` +
          `"${title}" similar to "${article.title}"`,
        );
        return true;
      }
    }

    return false;
  }

  /**
   * Validation: Ensure source is valid before processing
   */
  private async validateSource(source: RssSource): Promise<void> {
    if (!source) {
      throw new Error('Source is null or undefined');
    }

    if (!source.isActive) {
      throw new Error(`Source "${source.name}" is not active`);
    }

    if (!source.url) {
      throw new Error(`Source "${source.name}" has no URL`);
    }

    // Additional validation: Check if URL is reachable (optional)
    // Could add URL format validation, SSL check, etc.
  }

  /**
   * Business Logic: Calculate processing statistics
   */
  calculateSuccessRate(stats: {
    newArticles: number;
    duplicates: number;
    errors: number;
  }): number {
    const total = stats.newArticles + stats.duplicates + stats.errors;
    if (total === 0) return 0;
    return (stats.newArticles / total) * 100;
  }
}

