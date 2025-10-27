/**
 * Base service interface for standard CRUD operations
 * Updated for .NET-style endpoints
 */
export interface IBaseService<T> {
  save(dto: any): Promise<T>;
  findAll(): Promise<T[]>;
  findOne(id: number): Promise<T>;
  remove(id: number): Promise<void>;
}

