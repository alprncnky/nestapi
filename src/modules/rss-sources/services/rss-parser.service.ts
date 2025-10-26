import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { FeedTypeEnum } from '../enums/feed-type.enum';

export interface ParsedItem {
  title: string;
  link: string;
  guid: string;
  description: string;
  content?: string;
  contentPlain?: string;
  pubDate: Date;
  author?: string;
  imageUrl?: string;
  categories?: string[];
}

@Injectable()
export class RssParserService {
  private readonly logger = new Logger(RssParserService.name);
  private readonly parser: Parser;

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          ['content:encoded', 'contentEncoded'],
          ['media:content', 'mediaContent'],
          ['enclosure', 'enclosure'],
        ],
      },
      timeout: 10000,
    });
  }

  async parseFeed(url: string, feedType: FeedTypeEnum): Promise<ParsedItem[]> {
    try {
      this.logger.log(`Fetching RSS feed: ${url}`);
      const feed = await this.parser.parseURL(url);
      
      if (!feed.items || feed.items.length === 0) {
        this.logger.warn(`No items found in feed: ${url}`);
        return [];
      }

      this.logger.log(`Found ${feed.items.length} items in feed: ${url}`);
      return feed.items.map(item => this.normalizeItem(item));
    } catch (error) {
      this.logger.error(`Failed to parse RSS feed: ${url}`, error.stack);
      throw error;
    }
  }

  async validateFeedUrl(url: string): Promise<boolean> {
    try {
      await this.parser.parseURL(url);
      return true;
    } catch (error) {
      this.logger.warn(`Invalid RSS feed URL: ${url}`);
      return false;
    }
  }

  private normalizeItem(item: any): ParsedItem {
    const content = item.contentEncoded || item.content || item.description || '';
    const contentPlain = this.stripHtml(content);

    let imageUrl: string | undefined;
    if (item.enclosure?.url) {
      imageUrl = item.enclosure.url;
    } else if (item.mediaContent?.url) {
      imageUrl = item.mediaContent.url;
    } else {
      imageUrl = this.extractFirstImage(content);
    }

    return {
      title: item.title?.trim() || 'No Title',
      link: item.link || item.guid || '',
      guid: item.guid || item.link || '',
      description: this.stripHtml(item.description || '').substring(0, 500),
      content: content,
      contentPlain: contentPlain,
      pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      author: item.creator || item.author || undefined,
      imageUrl: imageUrl,
      categories: item.categories || [],
    };
  }

  private stripHtml(html: string): string {
    if (!html) return '';
    const $ = cheerio.load(html);
    return $('body').text().replace(/\s+/g, ' ').trim();
  }

  private extractFirstImage(html: string): string | undefined {
    if (!html) return undefined;
    const $ = cheerio.load(html);
    const firstImg = $('img').first();
    return firstImg.attr('src');
  }
}

