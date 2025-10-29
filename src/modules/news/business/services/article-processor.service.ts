import { Injectable, Logger } from '@nestjs/common';
import { NewsService } from './news.service';
import { StockMentionsService } from './stock-mentions.service';
import { ExtractedItemsService } from './extracted-items.service';
import { NewsTagsService } from './news-tags.service';
import { OpenAIService } from '../../../stock-prediction/business/services/openai.service';
import { NewsStatusEnum } from '../../contracts/enums/news-status.enum';
import { SentimentEnum } from '../../contracts/enums/sentiment.enum';
import { ImpactLevelEnum } from '../../contracts/enums/impact-level.enum';
import { NewsCategoryEnum } from '../../contracts/enums/news-category.enum';
import { EntityTypeEnum } from '../../contracts/enums/entity-type.enum';
import { TagTypeEnum } from '../../contracts/enums/tag-type.enum';
import { CreateStockMentionDto } from '../../contracts/requests/create-stock-mention.dto';
import { CreateExtractedItemDto } from '../../contracts/requests/create-extracted-item.dto';

/**
 * Article Processor Service
 * Processes news articles with AI/NLP analysis
 * 
 * Responsibilities:
 * - Sentiment analysis
 * - Categorization
 * - Impact level calculation
 * - Stock symbol extraction
 * - Entity extraction (NER)
 * - Tag extraction
 * - Status update to PROCESSED
 */
@Injectable()
export class ArticleProcessorService {
  private readonly logger = new Logger(ArticleProcessorService.name);

  constructor(
    private readonly newsService: NewsService,
    private readonly stockMentionsService: StockMentionsService,
    private readonly extractedItemsService: ExtractedItemsService,
    private readonly newsTagsService: NewsTagsService,
    private readonly openaiService: OpenAIService,
  ) {}

  /**
   * Process a single article with AI/NLP
   */
  async processArticle(articleId: number): Promise<void> {
    try {
      const article = await this.newsService.findById(articleId);
      const text = article.contentPlain || article.summary || article.title || '';

      if (!text || text.trim().length === 0) {
        this.logger.warn(`No text content for article ${articleId}`);
        return;
      }

      this.logger.debug(`Processing article ${articleId}: "${article.title}"`);

      // 1. Sentiment Analysis
      const sentimentResult = await this.openaiService.analyzeSentiment(text);
      await this.newsService.updateSentiment(article.id, sentimentResult.score);
      this.logger.debug(`Sentiment: ${sentimentResult.sentiment} (${sentimentResult.score})`);

      // 2. Categorization
      const categoryResult = await this.openaiService.categorizeNews(article.title, text);
      const category = this.mapCategoryStringToEnum(categoryResult.category);
      await this.newsService.updateCategory(article.id, category);
      this.logger.debug(`Category: ${category}`);

      // 3. Impact Level Calculation
      const impactLevel = this.calculateImpactLevel(text);
      await this.newsService.updateImpactLevel(article.id, impactLevel);
      this.logger.debug(`Impact Level: ${impactLevel}`);

      // 4. Extract Stock Symbols
      const stockSymbolsResult = await this.openaiService.extractStockSymbols(
        article.title + ' ' + text,
      );

      if (stockSymbolsResult.symbols.length > 0) {
        for (const symbolData of stockSymbolsResult.symbols) {
          const stockMentionDto: CreateStockMentionDto = {
            articleId: article.id,
            stockSymbol: symbolData.symbol.toUpperCase(),
            stockName: symbolData.companyName || symbolData.symbol,
            mentionCount: 1,
            sentiment: this.scoreToSentiment(sentimentResult.score),
            sentimentScore: sentimentResult.score,
          };

          await this.stockMentionsService.create(stockMentionDto);
        }
        this.logger.debug(`Extracted ${stockSymbolsResult.symbols.length} stock symbols`);
      } else {
        this.logger.debug(`No stock symbols found in article ${articleId}`);
      }

      // 5. Extract Entities (NER)
      const entitiesResult = await this.openaiService.extractEntities(text);
      
      if (entitiesResult.entities.length > 0) {
        const extractedItems: CreateExtractedItemDto[] = entitiesResult.entities.map((entity, index) => ({
          articleId: article.id,
          entityType: this.mapEntityTypeToEnum(entity.type),
          entityText: entity.text,
          confidence: entity.confidence,
          position: index,
        }));

        await this.extractedItemsService.createBulk(extractedItems);
        this.logger.debug(`Extracted ${extractedItems.length} entities`);
      }

      // 6. Extract Keywords as Tags (simple keyword extraction)
      const keywords = this.extractKeywords(text, 5);
      if (keywords.length > 0) {
        const tagIds: number[] = [];
        for (const keyword of keywords) {
          const tag = await this.newsTagsService.findOrCreate(
            keyword,
            TagTypeEnum.KEYWORD,
          );
          tagIds.push(tag.id);
        }
        await this.newsTagsService.attachTagsToArticle(article.id, tagIds);
        this.logger.debug(`Extracted ${keywords.length} keywords as tags`);
      }

      // 7. Mark as PROCESSED
      await this.newsService.updateStatus(article.id, NewsStatusEnum.PROCESSED);

      this.logger.log(`✅ Article ${articleId} processed successfully`);
    } catch (error) {
      this.logger.error(`❌ Failed to process article ${articleId}:`, error);
      // Optionally mark as FAILED if needed
      // await this.newsService.updateStatus(articleId, NewsStatusEnum.FAILED);
      throw error;
    }
  }

  /**
   * Calculate impact level based on content analysis
   */
  private calculateImpactLevel(text: string): ImpactLevelEnum {
    const lowerText = text.toLowerCase();

    // Keywords that indicate high/critical impact
    const highImpactKeywords = [
      'milyar', 'trilyonlar', 'kriz', 'iflas', 'şok',
      'rekor', 'tarihinin en', 'kritik', 'acil', 'acil durum',
      'borsa durdu', 'trading halt', 'şirket kapatıldı',
    ];

    // Keywords that indicate medium impact
    const mediumImpactKeywords = [
      'milyon', 'anlaşma', 'sözleşme', 'yatırım',
      'satış', 'birleşme', 'ortaklık', 'sermaye artırımı',
      'genel kurul', 'kâr', 'zarar',
    ];

    // Check for high/critical impact
    if (highImpactKeywords.some(keyword => lowerText.includes(keyword))) {
      return ImpactLevelEnum.HIGH;
    }

    // Check for medium impact
    if (mediumImpactKeywords.some(keyword => lowerText.includes(keyword))) {
      return ImpactLevelEnum.MEDIUM;
    }

    // Default to low
    return ImpactLevelEnum.LOW;
  }

  /**
   * Extract keywords from text using simple frequency analysis
   */
  private extractKeywords(text: string, limit: number = 10): string[] {
    // Remove common Turkish stopwords
    const stopwords = new Set([
      'bir', 'bu', 've', 'ile', 'için', 'olan', 'ancak',
      'gibi', 'daha', 'çok', 'sonra', 'kadar', 'şu', 'o',
      'da', 'de', 'ki', 'mi', 'mu', 'mü', 'ile', 'üzerinde',
      'altında', 'içinde', 'dışında', 'arasında', 'var', 'yok',
    ]);

    // Tokenize and count
    const words = text
      .toLowerCase()
      .match(/\b[a-zçğıöşü]{4,}\b/g) || [];

    const frequency: Record<string, number> = {};

    words.forEach(word => {
      if (!stopwords.has(word)) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });

    // Sort by frequency and return top keywords
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word]) => word);
  }

  /**
   * Convert sentiment score to SentimentEnum
   */
  private scoreToSentiment(score: number): SentimentEnum {
    if (score > 0.3) return SentimentEnum.POSITIVE;
    if (score < -0.3) return SentimentEnum.NEGATIVE;
    return SentimentEnum.NEUTRAL;
  }

  /**
   * Map category string from OpenAI to NewsCategoryEnum
   */
  private mapCategoryStringToEnum(category: string): NewsCategoryEnum {
    const categoryUpper = category.toUpperCase();
    
    // Map OpenAI categories to our enum
    if (categoryUpper.includes('COMPANY') || categoryUpper.includes('ŞİRKET')) {
      return NewsCategoryEnum.COMPANY_NEWS;
    }
    if (categoryUpper.includes('ECONOMIC') || categoryUpper.includes('MAKRO') || categoryUpper.includes('EKONOMİ')) {
      return NewsCategoryEnum.MACRO_ECONOMY;
    }
    if (categoryUpper.includes('SECTOR') || categoryUpper.includes('SEKTÖR')) {
      return NewsCategoryEnum.SECTOR_NEWS;
    }
    if (categoryUpper.includes('INTERNATIONAL') || categoryUpper.includes('ULUSLARARASI')) {
      return NewsCategoryEnum.INTERNATIONAL;
    }
    if (categoryUpper.includes('POLICY') || categoryUpper.includes('POLITICAL') || categoryUpper.includes('POLİTİKA') || categoryUpper.includes('MEVZUAT')) {
      return NewsCategoryEnum.POLICY_REGULATION;
    }
    if (categoryUpper.includes('MARKET') || categoryUpper.includes('FINANCIAL') || categoryUpper.includes('BORSA') || categoryUpper.includes('FİNANS')) {
      return NewsCategoryEnum.FINANCIAL_MARKETS;
    }
    
    // Default
    return NewsCategoryEnum.MACRO_ECONOMY;
  }

  /**
   * Map entity type string from OpenAI to EntityTypeEnum
   */
  private mapEntityTypeToEnum(entityType: string): EntityTypeEnum {
    const typeUpper = entityType.toUpperCase();
    
    if (typeUpper === 'PERSON') return EntityTypeEnum.PERSON;
    if (typeUpper === 'ORGANIZATION') return EntityTypeEnum.ORGANIZATION;
    if (typeUpper === 'LOCATION') return EntityTypeEnum.LOCATION;
    if (typeUpper === 'MONEY') return EntityTypeEnum.MONEY;
    if (typeUpper === 'PERCENT') return EntityTypeEnum.PERCENT;
    if (typeUpper === 'DATE') return EntityTypeEnum.DATE;
    if (typeUpper === 'TIME') return EntityTypeEnum.TIME;
    if (typeUpper === 'PRODUCT') return EntityTypeEnum.PRODUCT;
    
    // Map 'OTHER' and unknown types to ORGANIZATION as default
    return EntityTypeEnum.ORGANIZATION;
  }
}
