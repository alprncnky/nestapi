import { NotFoundException, Param, ParseIntPipe, Body } from '@nestjs/common';
import { BaseRepository } from './base-repository';
import { BaseListResponseDto } from './base-dto';
import { 
  CreateEndpoint, 
  GetAllEndpoint, 
  GetByIdEndpoint, 
  UpdateEndpoint, 
  DeleteEndpoint 
} from '../decorators/endpoint.decorator';

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

  /**
   * POST /create - Create a new entity
   * This is a default implementation that can be overridden in derived classes
   */
  @CreateEndpoint('Entity', Object)
  async create(@Body() createDto: T2): Promise<T4> {
    return this.createEntity(createDto);
  }

  /**
   * GET /list - Get all entities
   * This is a default implementation that can be overridden in derived classes
   */
  @GetAllEndpoint('Entity', Object)
  async list(): Promise<T5> {
    return this.findAllEntities();
  }

  /**
   * GET /:id - Get entity by ID
   * This is a default implementation that can be overridden in derived classes
   */
  @GetByIdEndpoint('Entity', Object)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<T4> {
    return this.findOneEntity(id);
  }

  /**
   * PATCH /:id - Update entity by ID
   * This is a default implementation that can be overridden in derived classes
   */
  @UpdateEndpoint('Entity', Object)
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: T3): Promise<T4> {
    return this.updateEntity(id, updateDto);
  }

  /**
   * DELETE /:id - Delete entity by ID
   * This is a default implementation that can be overridden in derived classes
   */
  @DeleteEndpoint('Entity')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.removeEntity(id);
  }

  // Protected helper methods for use in derived classes or custom business logic
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

