import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtractedItem } from '../../data/entities/extracted-item.entity';
import { CreateExtractedItemDto } from '../../contracts/requests/create-extracted-item.dto';
import { EntityTypeEnum } from '../../contracts/enums/entity-type.enum';

/**
 * Service for Extracted Item operations
 * Handles Named Entity Recognition (NER) results
 */
@Injectable()
export class ExtractedItemsService {
  constructor(
    @InjectRepository(ExtractedItem)
    private readonly extractedItemRepository: Repository<ExtractedItem>,
  ) {}

  /**
   * Create a new extracted item
   */
  async create(
    createExtractedItemDto: CreateExtractedItemDto,
  ): Promise<ExtractedItem> {
    const item = new ExtractedItem();
    Object.assign(item, {
      ...createExtractedItemDto,
      confidence: createExtractedItemDto.confidence || 1.0,
      createdAt: new Date(),
    });

    return await this.extractedItemRepository.save(item);
  }

  /**
   * Create multiple extracted items in bulk
   */
  async createBulk(
    items: CreateExtractedItemDto[],
  ): Promise<ExtractedItem[]> {
    const extractedItems = items.map((itemDto) => {
      const item = new ExtractedItem();
      Object.assign(item, {
        ...itemDto,
        confidence: itemDto.confidence || 1.0,
        createdAt: new Date(),
      });
      return item;
    });

    return await this.extractedItemRepository.save(extractedItems);
  }

  /**
   * Find all extracted items for an article
   */
  async findByArticle(articleId: number): Promise<ExtractedItem[]> {
    return await this.extractedItemRepository.find({
      where: { articleId },
      order: { position: 'ASC' },
    });
  }

  /**
   * Find extracted items by entity type
   */
  async findByType(entityType: EntityTypeEnum): Promise<ExtractedItem[]> {
    return await this.extractedItemRepository.find({
      where: { entityType },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  /**
   * Find extracted items by article and type
   */
  async findByArticleAndType(
    articleId: number,
    entityType: EntityTypeEnum,
  ): Promise<ExtractedItem[]> {
    return await this.extractedItemRepository.find({
      where: { articleId, entityType },
      order: { position: 'ASC' },
    });
  }

  /**
   * Remove an extracted item
   */
  async remove(id: number): Promise<void> {
    const item = await this.extractedItemRepository.findOne({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`Extracted Item with ID ${id} not found`);
    }

    await this.extractedItemRepository.remove(item);
  }
}

