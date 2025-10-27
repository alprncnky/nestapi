import { NotFoundException, ParseIntPipe, Body, Query } from '@nestjs/common';
import { BaseRepository } from './base-repository';
import { CriteriaDto } from '../dto/criteria.dto';
import { GetEndpoint, GetListEndpoint, DeleteEndpoint } from '../decorators/endpoint.decorator';

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
  protected abstract getRequestClass(): new (...args: any[]) => T2;

  async save(@Body() dto: T2 | T3): Promise<T4> {
    return this.saveEntity(dto);
  }

  @GetEndpoint('Entity', Object)
  async get(@Query('id', ParseIntPipe) id: number): Promise<T4> {
    return this.getEntity(id);
  }

  @GetListEndpoint('Entity', CriteriaDto, Object)
  async getList(@Body() criteriaDto: CriteriaDto): Promise<T5> {
    return this.getListEntities(criteriaDto);
  }

  @DeleteEndpoint('Entity')
  async delete(@Query('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.deleteEntity(id);
  }

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

