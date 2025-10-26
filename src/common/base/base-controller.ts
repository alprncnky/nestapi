import { NotFoundException } from '@nestjs/common';
import { BaseRepository } from './base-repository';
import { BaseListResponseDto } from './base-dto';

export interface IBaseService<T> {
  create(createDto: any): Promise<T>;
  update(id: number, updateDto: any): Promise<T>;
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

  protected async createEntity(createDto: T2): Promise<T4> {
    const entity = await this.service.create(createDto);
    const ResponseClass = this.getResponseClass();
    return new ResponseClass(entity);
  }

  protected async findAllEntities(): Promise<T5> {
    if (!this.repository) {
      throw new Error('Repository not provided to BaseController');
    }
    const entities = await this.repository.findAll();
    const ResponseClass = this.getResponseClass();
    const ListResponseClass = this.getListResponseClass();
    const responseItems = entities.map((entity) => new ResponseClass(entity));
    return new ListResponseClass(responseItems, entities.length);
  }

  protected async findOneEntity(id: number): Promise<T4> {
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

  protected async updateEntity(id: number, updateDto: T3): Promise<T4> {
    const entity = await this.service.update(id, updateDto);
    const ResponseClass = this.getResponseClass();
    return new ResponseClass(entity);
  }

  protected async removeEntity(id: number): Promise<{ message: string }> {
    await this.service.remove(id);
    return { message: `${this.getEntityName()} with ID ${id} deleted successfully` };
  }
}

