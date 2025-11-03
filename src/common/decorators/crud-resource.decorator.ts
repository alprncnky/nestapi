import { applyDecorators, Controller, Post, Get, Delete, Body, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CriteriaDto } from '../dto/criteria.dto';

/**
 * Configuration for CRUD Resource decorator
 */
export interface CrudResourceConfig<TEntity, TRequest, TResponse, TListResponse> {
  path: string;
  entityName: string;
  entity: new () => TEntity;
  requestDto: new () => TRequest;
  responseDto: new (data: TEntity) => TResponse;
  listResponseDto: new (items: TResponse[], total: number) => TListResponse;
}

/**
 * Ultimate DRY decorator that combines @Controller, @ApiTags, and auto-registers CRUD endpoints
 * Eliminates magic strings and boilerplate code
 * 
 * @example
 * @CrudResource({
 *   path: 'feeds',
 *   entityName: 'Feed',
 *   entity: Feed,
 *   requestDto: SaveFeedDto,
 *   responseDto: FeedResponseDto,
 *   listResponseDto: FeedListResponseDto,
 * })
 * export class FeedController extends BaseController<...> {
 *   // All CRUD endpoints auto-registered!
 * }
 */
export function CrudResource<TEntity, TRequest, TResponse, TListResponse>(
  config: CrudResourceConfig<TEntity, TRequest, TResponse, TListResponse>
) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    // Store metadata on class prototype for use by endpoint decorators
    constructor.prototype.entityName = config.entityName;
    constructor.prototype.responseClass = config.responseDto;
    constructor.prototype.listResponseClass = config.listResponseDto;
    constructor.prototype.requestClass = config.requestDto;
    
    // Apply controller decorators
    const controllerDecorators = applyDecorators(
      Controller(config.path),
      ApiTags(config.entityName)
    );
    
    controllerDecorators(constructor as any);
    
    // Auto-register CRUD endpoints if they exist on the prototype
    const prototype = constructor.prototype;
    
    // Save endpoint (POST /save)
    if (prototype.save) {
      const saveDecorators = applyDecorators(
        Post('save'),
        ApiOperation({ summary: `Save ${config.entityName} (create or update)` }),
        ApiBody({ type: config.requestDto }),
        ApiResponse({
          status: 200,
          description: `${config.entityName} saved successfully`,
          type: config.responseDto,
        }),
        ApiResponse({ status: 400, description: 'Bad Request' }),
      );
      
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'save');
      if (descriptor) {
        saveDecorators(prototype, 'save', descriptor);
        Object.defineProperty(prototype, 'save', descriptor);
      }
    }
    
    // Get endpoint (GET /get)
    if (prototype.get) {
      const getDecorators = applyDecorators(
        Get('get'),
        ApiOperation({ summary: `Get ${config.entityName} by ID` }),
        ApiResponse({
          status: 200,
          description: `${config.entityName} found`,
          type: config.responseDto,
        }),
        ApiResponse({ status: 404, description: `${config.entityName} not found` }),
      );
      
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'get');
      if (descriptor) {
        getDecorators(prototype, 'get', descriptor);
        Object.defineProperty(prototype, 'get', descriptor);
      }
    }
    
    // GetList endpoint (POST /getlist)
    if (prototype.getList) {
      const getListDecorators = applyDecorators(
        Post('getlist'),
        ApiOperation({ summary: `Get paginated list of ${config.entityName}s` }),
        ApiBody({ type: CriteriaDto }),
        ApiResponse({
          status: 200,
          description: `List of ${config.entityName}s with pagination`,
          type: config.listResponseDto,
        }),
      );
      
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'getList');
      if (descriptor) {
        getListDecorators(prototype, 'getList', descriptor);
        Object.defineProperty(prototype, 'getList', descriptor);
      }
    }
    
    // Delete endpoint (DELETE /delete)
    if (prototype.delete) {
      const deleteDecorators = applyDecorators(
        Delete('delete'),
        ApiOperation({ summary: `Delete ${config.entityName} by ID` }),
        ApiResponse({ status: 200, description: `${config.entityName} deleted successfully` }),
        ApiResponse({ status: 404, description: `${config.entityName} not found` }),
      );
      
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'delete');
      if (descriptor) {
        deleteDecorators(prototype, 'delete', descriptor);
        Object.defineProperty(prototype, 'delete', descriptor);
      }
    }
    
    return constructor;
  };
}

