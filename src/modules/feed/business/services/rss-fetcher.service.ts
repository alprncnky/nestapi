import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';

@Injectable()
export class RssFetcherService {
  private readonly logger = new Logger(RssFetcherService.name);
  private readonly parser: Parser;

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [['content:encoded', 'contentEncoded'], ['media:content', 'mediaContent'], ['media:thumbnail', 'mediaThumbnail']],
      },
    });
  }

  async fetchRssFeed(url: string): Promise<Parser.Item[]> {
    try {
      const feed = await this.parser.parseURL(url);
      return feed.items;
    } catch (error) {
      this.logger.error(`Failed to fetch RSS feed from ${url}: ${error.message}`, error.stack);
      throw error;
    }
  }

  extractPlainText(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  getItemContent(item: any): string {
    return item.contentEncoded || item.content || item.description || item.contentSnippet || '';
  }

  getItemImageUrl(item: any): string | null {
    if (item.enclosure?.url) {
      return item.enclosure.url;
    }
    if (item.mediaThumbnail?.url) {
      return item.mediaThumbnail.url;
    }
    if (item.mediaContent?.url) {
      return item.mediaContent.url;
    }
    return null;
  }
}

