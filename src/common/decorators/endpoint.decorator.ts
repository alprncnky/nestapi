import { applyDecorators, Post, Get, Patch, Delete, Type } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

/**
 * Gets entity name from controller instance
 */
function getEntityNameFromController(target: any): string {
  return target.entityName || 'Entity';
}

/**
 * Gets request class from controller instance
 */
function getRequestClassFromController(target: any): any {
  return target.requestClass || Object;
}

/**
 * Gets response class from controller instance
 */
function getResponseClassFromController(target: any): any {
  return target.responseClass || Object;
}

/**
 * Decorator for SAVE endpoints (POST /save) - .NET style upsert
 * Handles both create and update operations
 * Automatically reads entityName, requestClass, and responseClass from controller
 */
export function SaveEndpoint(requestType?: any, responseType?: any) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const entityName = getEntityNameFromController(target);
    const reqType = requestType || getRequestClassFromController(target);
    const resType = responseType || getResponseClassFromController(target);
    
    const decorators = applyDecorators(
      Post('save'),
      ApiOperation({ summary: `Save ${entityName} (create or update)` }),
      ApiBody({ type: reqType }),
      ApiResponse({
        status: 200,
        description: `${entityName} saved successfully`,
        type: resType,
      }),
      ApiResponse({ status: 400, description: 'Bad Request' }),
    );
    
    return decorators(target, propertyKey, descriptor);
  };
}

/**
 * Decorator for GET endpoints (GET /get) - .NET style
 * Get entity by ID via query parameter
 */
export function GetEndpoint(entityName: string, responseType: any) {
  return applyDecorators(
    Get('get'),
    ApiOperation({ summary: `Get ${entityName} by ID` }),
    ApiResponse({
      status: 200,
      description: `${entityName} found`,
      type: responseType,
    }),
    ApiResponse({ status: 404, description: `${entityName} not found` }),
  );
}

/**
 * Decorator for GET LIST endpoints (POST /getlist) - .NET style
 * Get paginated list with sorting
 */
export function GetListEndpoint(entityName: string, requestType: any, responseType: any) {
  return applyDecorators(
    Post('getlist'),
    ApiOperation({ summary: `Get paginated list of ${entityName}s` }),
    ApiBody({ type: requestType }),
    ApiResponse({
      status: 200,
      description: `List of ${entityName}s with pagination`,
      type: responseType,
    }),
  );
}

/**
 * Decorator for DELETE endpoints (DELETE /delete) - .NET style
 * Delete entity by ID via query parameter
 */
export function DeleteEndpoint(entityName: string) {
  return applyDecorators(
    Delete('delete'),
    ApiOperation({ summary: `Delete ${entityName} by ID` }),
    ApiResponse({ status: 200, description: `${entityName} deleted successfully` }),
    ApiResponse({ status: 404, description: `${entityName} not found` }),
  );
}

/**
 * Decorator for REGISTER endpoints (POST /register)
 */
export function RegisterEndpoint(entityName: string, responseType: any) {
  return applyDecorators(
    Post('register'),
    ApiOperation({ summary: `Register a new ${entityName}` }),
    ApiResponse({
      status: 201,
      description: `${entityName} registered successfully`,
      type: responseType,
    }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
  );
}

/**
 * Decorator for GET BY FIELD endpoints (GET /field/:value)
 * Entity name is automatically derived from controller's getEntityName() method
 */
export function GetByFieldEndpoint(fieldName: string, responseType: any) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const entityName = getEntityNameFromController(target);
    
    const decorators = applyDecorators(
      Get(`${fieldName}/:${fieldName}`),
      ApiOperation({ summary: `Get ${entityName} by ${fieldName}` }),
      ApiParam({ name: fieldName, type: 'string', description: `${entityName} ${fieldName}` }),
      ApiResponse({
        status: 200,
        description: `${entityName} found`,
        type: responseType,
      }),
      ApiResponse({ status: 404, description: `${entityName} not found` }),
    );
    
    return decorators(target, propertyKey, descriptor);
  };
}

/**
 * Decorator for GET ACTIVE endpoints (GET /active)
 * Entity name is automatically derived from controller's getEntityName() method
 */
export function GetActiveEndpoint(responseType: any) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const entityName = getEntityNameFromController(target);
    
    const decorators = applyDecorators(
      Get('active'),
      ApiOperation({ summary: `Get all active ${entityName}s` }),
      ApiResponse({
        status: 200,
        description: `List of active ${entityName}s`,
        type: responseType,
      }),
    );
    
    return decorators(target, propertyKey, descriptor);
  };
}

/**
 * Decorator for GET BY CATEGORY endpoints (GET /category/:category)
 * Entity name is automatically derived from controller's getEntityName() method
 */
export function GetByCategoryEndpoint(
  responseType: any,
  categoryEnum: any,
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const entityName = getEntityNameFromController(target);
    
    const decorators = applyDecorators(
      Get('category/:category'),
      ApiOperation({ summary: `Get ${entityName}s by category` }),
      ApiParam({
        name: 'category',
        enum: categoryEnum,
        description: `${entityName} category`,
      }),
      ApiResponse({
        status: 200,
        description: `List of ${entityName}s in the specified category`,
        type: responseType,
      }),
    );
    
    return decorators(target, propertyKey, descriptor);
  };
}

/**
 * Decorator for GET BY STATUS endpoints (GET /status/:status)
 * Entity name is automatically derived from controller's getEntityName() method
 */
export function GetByStatusEndpoint(
  responseType: any,
  statusEnum: any,
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const entityName = getEntityNameFromController(target);
    
    const decorators = applyDecorators(
      Get('status/:status'),
      ApiOperation({ summary: `Get ${entityName}s by status` }),
      ApiParam({
        name: 'status',
        enum: statusEnum,
        description: `${entityName} status`,
      }),
      ApiResponse({
        status: 200,
        description: `List of ${entityName}s with the specified status`,
        type: responseType,
      }),
    );
    
    return decorators(target, propertyKey, descriptor);
  };
}

/**
 * Decorator for UPDATE FIELD endpoints (PATCH /:id/field/:value)
 * Entity name is automatically derived from controller's getEntityName() method
 */
export function UpdateFieldEndpoint(
  fieldName: string,
  responseType: any,
  fieldType: 'number' | 'string' = 'number',
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const entityName = getEntityNameFromController(target);
    
    const decorators = applyDecorators(
      Patch(`:id/${fieldName}/:${fieldName}`),
      ApiOperation({ summary: `Update ${fieldName} for ${entityName}` }),
      ApiParam({ name: 'id', type: 'number', description: `${entityName} ID` }),
      ApiParam({
        name: fieldName,
        type: fieldType,
        description: `New ${fieldName} value`,
      }),
      ApiResponse({
        status: 200,
        description: `${fieldName} updated successfully`,
        type: responseType,
      }),
      ApiResponse({ status: 404, description: `${entityName} not found` }),
    );
    
    return decorators(target, propertyKey, descriptor);
  };
}

/**
 * Decorator for GET RELATED endpoints (GET /:id/related)
 * Entity name is automatically derived from controller's getEntityName() method
 */
export function GetRelatedEndpoint(
  relatedName: string,
  responseType: any,
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const entityName = getEntityNameFromController(target);
    
    const decorators = applyDecorators(
      Get(`:id/${relatedName}`),
      ApiOperation({ summary: `Get ${relatedName} for a specific ${entityName}` }),
      ApiParam({ name: 'id', type: 'number', description: `${entityName} ID` }),
      ApiResponse({
        status: 200,
        description: `List of ${relatedName} for the ${entityName}`,
        type: responseType,
      }),
    );
    
    return decorators(target, propertyKey, descriptor);
  };
}

/**
 * Decorator for GET PENDING endpoints (GET /pending)
 * Entity name is automatically derived from controller's getEntityName() method
 */
export function GetPendingEndpoint(responseType: any) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const entityName = getEntityNameFromController(target);
    
    const decorators = applyDecorators(
      Get('pending'),
      ApiOperation({ summary: `Get pending ${entityName}s awaiting evaluation` }),
      ApiResponse({
        status: 200,
        description: `List of pending ${entityName}s`,
        type: responseType,
      }),
    );
    
    return decorators(target, propertyKey, descriptor);
  };
}

/**
 * Decorator for GET REPORT endpoints (GET /report or GET /:id/report)
 * Entity name is automatically derived from controller's getEntityName() method
 */
export function GetReportEndpoint(
  reportName: string,
  hasIdParam: boolean = false,
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const entityName = getEntityNameFromController(target);
    const path = hasIdParam ? ':id/' + reportName : reportName;
    const decorators = [
      Get(path),
      ApiOperation({ summary: `Get ${reportName} for ${entityName}` }),
    ];

    if (hasIdParam) {
      decorators.push(
        ApiParam({ name: 'id', type: 'number', description: `${entityName} ID` }),
      );
    }

    decorators.push(
      ApiResponse({
        status: 200,
        description: `${reportName} data`,
      }),
    );

    const combinedDecorators = applyDecorators(...decorators);
    return combinedDecorators(target, propertyKey, descriptor);
  };
}

