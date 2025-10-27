import { NotFoundException, Param, ParseIntPipe, Body, Query } from '@nestjs/common';
import { BaseRepository } from './base-repository';
import { BaseListResponseDto } from './base-dto';
import { CriteriaDto } from '../dto/criteria.dto';
import { 
  SaveEndpoint, 
  GetEndpoint, 
  GetListEndpoint, 
  DeleteEndpoint 
} from '../decorators/endpoint.decorator';

export interface IBaseService<T> {
  save(dto: any): Promise<T>;
  remove(id: number): Promise<void>;
}

export abstract class BaseController<T1, T2, T3, T4, T5> {
  constructor(
    protected readonly service: IBaseService<T1>,
    protected readonly repository?: BaseRepository<any>,
  ) {}

  protected abstract getResponseClass(): new (data: T1) => T4;
  protected abstract getListResponseClass(): new (items: T4[], total: number) => T5;
  protected abstract getEntityName(): string;

  /**
   * POST /save - Save entity (create or update)
   * This is a default implementation that can be overridden in derived classes
   * .NET-style endpoint
   */
  @SaveEndpoint('Entity', Object)
  async save(@Body() dto: T2 | T3): Promise<T4> {
    return this.saveEntity(dto);
  }

  /**
   * GET /get - Get entity by ID
   * This is a default implementation that can be overridden in derived classes
   * .NET-style endpoint
   */
  @GetEndpoint('Entity', Object)
  async get(@Query('id', ParseIntPipe) id: number): Promise<T4> {
    return this.getEntity(id);
  }

  /**
   * POST /getlist - Get paginated list of entities
   * This is a default implementation that can be overridden in derived classes
   * .NET-style endpoint
   */
  @GetListEndpoint('Entity', Object)
  async getList(@Body() criteriaDto: CriteriaDto): Promise<T5> {
    return this.getListEntities(criteriaDto);
  }

  /**
   * DELETE /delete - Delete entity by ID
   * This is a default implementation that can be overridden in derived classes
   * .NET-style endpoint
   */
  @DeleteEndpoint('Entity')
  async delete(@Query('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.deleteEntity(id);
  }

  // Protected helper methods for use in derived classes or custom business logic
  protected async saveEntity(dto: T2 | T3): Promise<T4> {
    const entity = await this.service.save(dto);
    const ResponseClass = this.getResponseClass();
    return new ResponseClass(entity);
  }

  protected async getEntity(id: number): Promise<T4> {
    if (!this.repository) {
      throw new Error('Repository not provided to BaseController');
    }
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`${this.getEntityName()} with ID ${id} not found`);
    }
    const ResponseClass = this.getResponseClass();
    return new ResponseClass(entity);
  }

  protected async getListEntities(criteriaDto: CriteriaDto): Promise<T5> {
    if (!this.repository) {
      throw new Error('Repository not provided to BaseController');
    }
    const { entities, totalCount } = await this.repository.findWithPagination(criteriaDto);
    const ResponseClass = this.getResponseClass();
    const ListResponseClass = this.getListResponseClass();
    const responseItems = entities.map((entity) => new ResponseClass(entity));
    return new ListResponseClass(responseItems, totalCount);
  }

  protected async deleteEntity(id: number): Promise<{ message: string }> {
    await this.service.remove(id);
    return { message: `${this.getEntityName()} with ID ${id} deleted successfully` };
  }
}

