import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { StockMention } from '../../data/entities/stock-mention.entity';
import { CreateStockMentionDto } from '../../contracts/requests/create-stock-mention.dto';
import { SentimentEnum } from '../../contracts/enums/sentiment.enum';

/**
 * Service for Stock Mention operations
 * Handles stock mentions in news articles
 */
@Injectable()
export class StockMentionsService {
  constructor(
    @InjectRepository(StockMention)
    private readonly stockMentionRepository: Repository<StockMention>,
  ) {}

  /**
   * Create a new stock mention
   */
  async create(
    createStockMentionDto: CreateStockMentionDto,
  ): Promise<StockMention> {
    const mention = new StockMention();
    Object.assign(mention, {
      ...createStockMentionDto,
      sentiment: createStockMentionDto.sentiment || SentimentEnum.NEUTRAL,
      mentionCount: createStockMentionDto.mentionCount || 1,
      createdAt: new Date(),
    });

    return await this.stockMentionRepository.save(mention);
  }

  /**
   * Find all mentions for an article
   */
  async findByArticle(articleId: number): Promise<StockMention[]> {
    return await this.stockMentionRepository.find({
      where: { articleId },
      order: { mentionCount: 'DESC' },
    });
  }

  /**
   * Find all mentions for a stock symbol
   */
  async findByStock(stockSymbol: string): Promise<StockMention[]> {
    return await this.stockMentionRepository.find({
      where: { stockSymbol },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  /**
   * Find stock mentions by stock and date range
   */
  async findByStockAndDateRange(
    symbol: string,
    startDate: Date,
    endDate: Date,
  ): Promise<StockMention[]> {
    return await this.stockMentionRepository
      .createQueryBuilder('mention')
      .where('mention.stockSymbol = :symbol', { symbol })
      .andWhere('mention.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('mention.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Update sentiment for a mention
   */
  async updateSentiment(
    id: number,
    sentiment: SentimentEnum,
    sentimentScore?: number,
  ): Promise<void> {
    const updateData: any = { sentiment };
    
    if (sentimentScore !== undefined) {
      if (sentimentScore < -1 || sentimentScore > 1) {
        throw new Error('Sentiment score must be between -1 and 1');
      }
      updateData.sentimentScore = sentimentScore;
    }

    await this.stockMentionRepository.update(id, updateData);
  }

  /**
   * Remove a stock mention
   */
  async remove(id: number): Promise<void> {
    const mention = await this.stockMentionRepository.findOne({
      where: { id },
    });

    if (!mention) {
      throw new NotFoundException(`Stock Mention with ID ${id} not found`);
    }

    await this.stockMentionRepository.remove(mention);
  }
}

