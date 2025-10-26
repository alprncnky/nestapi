# BaseController Default Endpoints

## Overview

The `BaseController` now provides **default CRUD endpoints** out of the box. Any controller extending `BaseController` automatically inherits these standard endpoints without needing to implement them manually.

## Available Default Endpoints

### 1. **POST /create** - Create Entity
- **Method**: `create(@Body() createDto: T2)`
- **Decorator**: `@CreateEndpoint('Entity', Object)`
- **Description**: Creates a new entity
- **Request Body**: CreateDto
- **Response**: Single entity response (T4)

### 2. **GET /list** - Get All Entities
- **Method**: `list()`
- **Decorator**: `@GetAllEndpoint('Entity', Object)`
- **Description**: Retrieves all entities
- **Response**: List response (T5)

### 3. **GET /:id** - Get Entity By ID
- **Method**: `findOne(@Param('id') id: number)`
- **Decorator**: `@GetByIdEndpoint('Entity', Object)`
- **Description**: Retrieves a single entity by ID
- **Response**: Single entity response (T4)

### 4. **PATCH /:id** - Update Entity
- **Method**: `update(@Param('id') id: number, @Body() updateDto: T3)`
- **Decorator**: `@UpdateEndpoint('Entity', Object)`
- **Description**: Updates an existing entity
- **Request Body**: UpdateDto
- **Response**: Single entity response (T4)

### 5. **DELETE /:id** - Delete Entity
- **Method**: `remove(@Param('id') id: number)`
- **Decorator**: `@DeleteEndpoint('Entity')`
- **Description**: Deletes an entity by ID
- **Response**: Success message object

## How to Use

### Simple Controller (Automatic CRUD)

```typescript
@CrudController('users', 'User')
export class UsersController extends BaseController<
  User,                    // T1: Entity
  CreateUserDto,          // T2: Create DTO
  UpdateUserDto,          // T3: Update DTO
  UserResponseDto,        // T4: Single Response
  UserListResponseDto     // T5: List Response
> {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersRepository: UserRepository,
  ) {
    super(usersService, usersRepository);
  }
  
  protected getResponseClass = () => UserResponseDto;
  protected getListResponseClass = () => UserListResponseDto;
  protected getEntityName = () => 'User';
  
  // That's it! All CRUD endpoints are automatically available:
  // POST /api/v1/users/create
  // GET /api/v1/users/list
  // GET /api/v1/users/:id
  // PATCH /api/v1/users/:id
  // DELETE /api/v1/users/:id
}
```

### Controller with Custom Endpoints

```typescript
@CrudController('rss-sources', 'RssSource')
export class RssSourcesController extends BaseController<
  RssSource, 
  CreateRssSourceDto, 
  UpdateRssSourceDto, 
  RssSourceResponseDto, 
  RssSourceListResponseDto
> {
  constructor(
    private readonly rssSourcesService: RssSourcesService,
    private readonly rssSourceRepository: RssSourceRepository,
  ) {
    super(rssSourcesService, rssSourceRepository);
  }

  protected getResponseClass = () => RssSourceResponseDto;
  protected getListResponseClass = () => RssSourceListResponseDto;
  protected getEntityName = () => 'RssSource';

  // Base CRUD endpoints inherited automatically
  // Add custom business endpoints below:

  @GetActiveEndpoint('RssSource', RssSourceListResponseDto)
  async getActiveSources(): Promise<RssSourceListResponseDto> {
    const sources = await this.rssSourceRepository.findActive();
    return new RssSourceListResponseDto(
      sources.map((source) => new RssSourceResponseDto(source)), 
      sources.length
    );
  }

  @GetByCategoryEndpoint('RssSource', RssSourceListResponseDto, SourceCategoryEnum)
  async getByCategory(
    @Param('category', new ParseEnumPipe(SourceCategoryEnum)) category: SourceCategoryEnum
  ): Promise<RssSourceListResponseDto> {
    const sources = await this.rssSourceRepository.findActiveByCategory(category);
    return new RssSourceListResponseDto(
      sources.map((source) => new RssSourceResponseDto(source)), 
      sources.length
    );
  }
}
```

## Overriding Default Endpoints

You can override any default endpoint with custom business logic by simply redefining the method in your controller:

```typescript
@CrudController('products', 'Product')
export class ProductsController extends BaseController<
  Product, 
  CreateProductDto, 
  UpdateProductDto, 
  ProductResponseDto, 
  ProductListResponseDto
> {
  // ... constructor and abstract methods ...

  // Override default create with custom validation
  @CreateEndpoint('Product', ProductResponseDto)
  async create(@Body() createDto: CreateProductDto): Promise<ProductResponseDto> {
    // Custom business logic here
    await this.validateProductAvailability(createDto);
    
    // Use the base helper method
    return this.createEntity(createDto);
  }

  // Other endpoints remain inherited automatically
}
```

## Protected Helper Methods

The following protected methods are available for custom business logic:

- `createEntity(createDto: T2): Promise<T4>` - Create entity logic
- `findAllEntities(): Promise<T5>` - Get all entities logic
- `findOneEntity(id: number): Promise<T4>` - Get one entity logic
- `updateEntity(id: number, updateDto: T3): Promise<T4>` - Update entity logic
- `removeEntity(id: number): Promise<{ message: string }>` - Delete entity logic

These can be called from overridden methods or custom endpoints to reuse base functionality.

## Benefits

✅ **Less Boilerplate**: No need to manually define standard CRUD endpoints  
✅ **Consistent API**: All controllers follow the same pattern  
✅ **Easy Customization**: Override only what you need  
✅ **Automatic Swagger**: All endpoints documented automatically  
✅ **Type Safety**: Full TypeScript type checking  
✅ **Clean Code**: Focus on business logic, not repetitive CRUD  

## Migration Guide

### Before (Manual Implementation)
```typescript
@CreateEndpoint('User', UserResponseDto)
create(@Body() createUserDto: CreateUserDto) {
  return this.createEntity(createUserDto);
}

@GetAllEndpoint('User', UserListResponseDto)
findAll() {
  return this.findAllEntities();
}

@GetByIdEndpoint('User', UserResponseDto)
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.findOneEntity(id);
}

// etc...
```

### After (Automatic Inheritance)
```typescript
// No need to define these - they're inherited automatically!
// Just add custom endpoints as needed
```

## Summary

With the updated `BaseController`, you get full CRUD functionality out of the box. Simply:

1. Extend `BaseController` with proper type parameters
2. Implement the three abstract methods (getResponseClass, getListResponseClass, getEntityName)
3. Inject service and repository in constructor
4. Add only your custom business endpoints

All standard CRUD operations are available automatically! 🚀

