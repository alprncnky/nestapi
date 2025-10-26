import { applyDecorators, Post, Get, Patch, Delete, Type } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

/**
 * Decorator for CREATE endpoints (POST /)
 */
export function CreateEndpoint(entityName: string, responseType: any) {
  return applyDecorators(
    Post(),
    ApiOperation({ summary: `Create a new ${entityName}` }),
    ApiResponse({
      status: 201,
      description: `${entityName} created successfully`,
      type: responseType,
    }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
  );
}

/**
 * Decorator for GET ALL endpoints (GET /)
 */
export function GetAllEndpoint(entityName: string, responseType: any, queryParams?: string[]) {
  const decorators = [
    Get(),
    ApiOperation({ summary: `Get all ${entityName}s` }),
    ApiResponse({
      status: 200,
      description: `List of ${entityName}s`,
      type: responseType,
    }),
  ];

  return applyDecorators(...decorators);
}

/**
 * Decorator for GET BY ID endpoints (GET /:id)
 */
export function GetByIdEndpoint(entityName: string, responseType: any) {
  return applyDecorators(
    Get(':id'),
    ApiOperation({ summary: `Get ${entityName} by ID` }),
    ApiParam({ name: 'id', type: 'number', description: `${entityName} ID` }),
    ApiResponse({
      status: 200,
      description: `${entityName} found`,
      type: responseType,
    }),
    ApiResponse({ status: 404, description: `${entityName} not found` }),
  );
}

/**
 * Decorator for UPDATE endpoints (PATCH /:id)
 */
export function UpdateEndpoint(entityName: string, responseType: any) {
  return applyDecorators(
    Patch(':id'),
    ApiOperation({ summary: `Update ${entityName} by ID` }),
    ApiParam({ name: 'id', type: 'number', description: `${entityName} ID` }),
    ApiResponse({
      status: 200,
      description: `${entityName} updated successfully`,
      type: responseType,
    }),
    ApiResponse({ status: 404, description: `${entityName} not found` }),
  );
}

/**
 * Decorator for DELETE endpoints (DELETE /:id)
 */
export function DeleteEndpoint(entityName: string) {
  return applyDecorators(
    Delete(':id'),
    ApiOperation({ summary: `Delete ${entityName} by ID` }),
    ApiParam({ name: 'id', type: 'number', description: `${entityName} ID` }),
    ApiResponse({ status: 200, description: `${entityName} deleted successfully` }),
    ApiResponse({ status: 404, description: `${entityName} not found` }),
  );
}

/**
 * Decorator for SAVE endpoints (POST /save) - custom business operation
 */
export function SaveEndpoint(entityName: string, responseType: any) {
  return applyDecorators(
    Post('save'),
    ApiOperation({ summary: `Save ${entityName} with additional business logic` }),
    ApiResponse({
      status: 201,
      description: `${entityName} saved successfully`,
      type: responseType,
    }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
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
 */
export function GetByFieldEndpoint(entityName: string, fieldName: string, responseType: any) {
  return applyDecorators(
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
}

/**
 * Decorator for GET ACTIVE endpoints (GET /active)
 */
export function GetActiveEndpoint(entityName: string, responseType: any) {
  return applyDecorators(
    Get('active'),
    ApiOperation({ summary: `Get all active ${entityName}s` }),
    ApiResponse({
      status: 200,
      description: `List of active ${entityName}s`,
      type: responseType,
    }),
  );
}

/**
 * Decorator for GET BY CATEGORY endpoints (GET /category/:category)
 */
export function GetByCategoryEndpoint(
  entityName: string,
  responseType: any,
  categoryEnum: any,
) {
  return applyDecorators(
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
}

/**
 * Decorator for GET BY STATUS endpoints (GET /status/:status)
 */
export function GetByStatusEndpoint(
  entityName: string,
  responseType: any,
  statusEnum: any,
) {
  return applyDecorators(
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
}

/**
 * Decorator for UPDATE FIELD endpoints (PATCH /:id/field/:value)
 */
export function UpdateFieldEndpoint(
  entityName: string,
  fieldName: string,
  responseType: any,
  fieldType: 'number' | 'string' = 'number',
) {
  return applyDecorators(
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
}

/**
 * Decorator for GET RELATED endpoints (GET /:id/related)
 */
export function GetRelatedEndpoint(
  entityName: string,
  relatedName: string,
  responseType: any,
) {
  return applyDecorators(
    Get(`:id/${relatedName}`),
    ApiOperation({ summary: `Get ${relatedName} for a specific ${entityName}` }),
    ApiParam({ name: 'id', type: 'number', description: `${entityName} ID` }),
    ApiResponse({
      status: 200,
      description: `List of ${relatedName} for the ${entityName}`,
      type: responseType,
    }),
  );
}

/**
 * Decorator for GET PENDING endpoints (GET /pending)
 */
export function GetPendingEndpoint(entityName: string, responseType: any) {
  return applyDecorators(
    Get('pending'),
    ApiOperation({ summary: `Get pending ${entityName}s awaiting evaluation` }),
    ApiResponse({
      status: 200,
      description: `List of pending ${entityName}s`,
      type: responseType,
    }),
  );
}

/**
 * Decorator for GET REPORT endpoints (GET /report or GET /:id/report)
 */
export function GetReportEndpoint(
  entityName: string,
  reportName: string,
  hasIdParam: boolean = false,
) {
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

  return applyDecorators(...decorators);
}

