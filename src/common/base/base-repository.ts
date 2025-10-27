import { Repository, FindOptionsWhere, FindManyOptions, ObjectLiteral } from 'typeorm';
import { CriteriaDto } from '../dto/criteria.dto';

export abstract class BaseRepository<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(options);
  }

  async findById(id: number): Promise<T | null> {
    return await this.repository.findOne({ where: { id } as any });
  }

  async findOne(where: FindOptionsWhere<T>): Promise<T | null> {
    return await this.repository.findOne({ where });
  }

  async findBy(where: FindOptionsWhere<T>, options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find({ where, ...options });
  }

  async save(entity: T): Promise<T> {
    return await this.repository.save(entity);
  }

  async saveMany(entities: T[]): Promise<T[]> {
    return await this.repository.save(entities);
  }

  async update(id: number, partialEntity: Partial<T>): Promise<void> {
    await this.repository.update(id as any, partialEntity as any);
  }

  async remove(entity: T): Promise<void> {
    await this.repository.remove(entity);
  }

  async removeById(id: number): Promise<void> {
    await this.repository.delete(id as any);
  }

  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return await this.repository.count({ where });
  }

  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.count({ where });
    return count > 0;
  }

  async findWithPagination(criteriaDto: CriteriaDto): Promise<{ entities: T[]; totalCount: number }> {
    const skip = criteriaDto.page * criteriaDto.pageSize;
    const order = criteriaDto.sortField 
      ? { [criteriaDto.sortField]: criteriaDto.sortType || 'ASC' } 
      : undefined;
    
    const [entities, totalCount] = await this.repository.findAndCount({
      skip,
      take: criteriaDto.pageSize,
      order: order as any,
    });
    
    return { entities, totalCount };
  }
}

