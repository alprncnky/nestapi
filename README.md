# InsightAPI

A NestJS API built with Clean Architecture principles, featuring zero-boilerplate decorators and automatic CRUD operations.
Im just a .NET Developer minded. So trying to create base NestJS Api by that point of view.

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run start:dev
```

### Access Points
- **API Base**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs

### Test the API
```bash
./test-api.sh
```

## Key Features

- ✅ **Zero Boilerplate** - Three magic decorators eliminate repetitive code
- ✅ **Auto CRUD** - Base controller with standard operations
- ✅ **Auto Validation** - Centralized validation rules
- ✅ **Auto Mapping** - Entity ↔ DTO transformations
- ✅ **Auto Swagger** - API documentation generated automatically
- ✅ **Type Safe** - Full TypeScript support

## Architecture

This project follows a **3-Layer Clean Architecture** pattern:
- **Controller Layer**: API endpoints and request handling
- **Service Layer**: Business logic and validation
- **Data Layer**: Repository pattern for data access

### The Three Magic Decorators

```typescript
// 1. Entities - No constructor needed!
@AutoEntity()
export class User {
  id: number;
  name: string;
}

// 2. Input DTOs - Validation from config
@AutoApplyDecorators(CreateUserMapping)
export class CreateUserDto extends BaseCreateDto {
  name: string;
}

// 3. Response DTOs - Auto-mapping + Swagger
@AutoResponse(UserResponseMapping)
export class UserResponseDto extends BaseResponseDto {
  name: string;
}
```

**Result**: Write 70% less code and focus on business logic!

## Documentation

For complete architectural guidelines, patterns, and best practices:

📖 **See [AGENTS.md](./AGENTS.md)** - Comprehensive guide for building and maintaining this API

## Example Module

The project includes a complete **Payment** module demonstrating all patterns:

- Standard CRUD endpoints
- Custom business operations (process, refund)
- Status-based filtering
- Full Swagger documentation

See `src/modules/payment/` for implementation details.

## Project Structure

```
src/
├── common/           # Shared infrastructure (decorators, base classes, filters)
├── modules/          # Feature modules
│   └── payment/      # Example module
├── app.module.ts     # Root module
└── main.ts           # Application bootstrap
```

## License

MIT
