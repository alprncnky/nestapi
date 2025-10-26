/**
 * Entity Schema Metadata for TypeORM
 * This allows defining TypeORM schema separately from clean domain entities
 */

export interface ColumnOptions {
  type?: string;
  length?: number;
  nullable?: boolean;
  unique?: boolean;
  default?: any;
  precision?: number;
  scale?: number;
  enum?: any;
  comment?: string;
}

export interface RelationOptions {
  type: 'one-to-many' | 'many-to-one' | 'many-to-many';
  target: string | (() => any);
  inverseSide?: string;
  cascade?: boolean;
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
}

export interface EntitySchemaMetadata {
  tableName: string;
  columns: {
    [key: string]: ColumnOptions;
  };
  relations?: {
    [key: string]: RelationOptions;
  };
  indexes?: Array<{
    name?: string;
    columns: string[];
    unique?: boolean;
  }>;
}

// Storage for entity metadata
const entitySchemaRegistry = new Map<Function, EntitySchemaMetadata>();

/**
 * Register entity schema metadata
 */
export function registerEntitySchema(
  target: Function,
  metadata: EntitySchemaMetadata,
): void {
  entitySchemaRegistry.set(target, metadata);
}

/**
 * Get entity schema metadata
 */
export function getEntitySchema(target: Function): EntitySchemaMetadata | undefined {
  return entitySchemaRegistry.get(target);
}

/**
 * Decorator to define TypeORM schema for clean entities
 * Usage:
 * @EntitySchema({
 *   tableName: 'users',
 *   columns: {
 *     id: { type: 'int', primary: true, generated: true },
 *     name: { type: 'varchar', length: 255 },
 *     email: { type: 'varchar', length: 255, unique: true }
 *   }
 * })
 */
export function EntitySchema(metadata: EntitySchemaMetadata) {
  return function (target: Function) {
    registerEntitySchema(target, metadata);
  };
}

