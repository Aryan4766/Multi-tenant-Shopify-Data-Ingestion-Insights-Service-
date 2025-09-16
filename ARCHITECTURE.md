# Xeno Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  React Frontend (Port 3000)                                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │   Dashboard     │  │   Analytics     │  │   Settings      │                │
│  │   - Overview    │  │   - Customers   │  │   - Profile     │                │
│  │   - Metrics     │  │   - Orders      │  │   - Tenant      │                │
│  │   - Charts      │  │   - Products    │  │   - Sync        │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                    React Query (State Management)                      │    │
│  │  - API Caching  - Background Refetch  - Optimistic Updates            │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTPS/API Calls
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                API GATEWAY                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Express.js Server (Port 5000)                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                        Middleware Stack                                │    │
│  │  - Helmet (Security)  - CORS  - Rate Limiting  - JWT Auth             │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │   Auth Routes   │  │  Tenant Routes  │  │  Sync Routes    │                │
│  │   - /auth/*     │  │   - /tenants/*  │  │   - /sync/*     │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │ Analytics Routes│  │  Scheduler      │  │  Error Handler  │                │
│  │   - /analytics/*│  │   - node-cron   │  │   - Winston     │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Database Queries
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│  MySQL Database (Multi-tenant)                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                        Core Tables                                    │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │    │
│  │  │   tenants   │  │    users    │  │  customers  │  │  products   │   │    │
│  │  │ - id        │  │ - id        │  │ - id        │  │ - id        │   │    │
│  │  │ - name      │  │ - email     │  │ - shopifyId │  │ - shopifyId │   │    │
│  │  │ - domain    │  │ - password  │  │ - email     │  │ - title     │   │    │
│  │  │ - token     │  │ - tenantId  │  │ - totalSpent│  │ - vendor    │   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │    │
│  │                                                                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                    │    │
│  │  │    orders   │  │ order_items │  │  sync_logs  │                    │    │
│  │  │ - id        │  │ - id        │  │ - id        │                    │    │
│  │  │ - shopifyId │  │ - orderId   │  │ - tenantId  │                    │    │
│  │  │ - totalPrice│  │ - productId │  │ - syncType  │                    │    │
│  │  │ - status    │  │ - quantity  │  │ - status    │                    │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                    │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                    Sequelize ORM                                       │    │
│  │  - Model Definitions  - Associations  - Migrations  - Validations     │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ API Calls
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            EXTERNAL SERVICES                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Shopify API Integration                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                    ShopifyService                                      │    │
│  │  - Customer Sync  - Product Sync  - Order Sync  - Error Handling      │    │
│  │  - Rate Limiting  - Pagination  - Data Transformation                 │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                    Shopify REST API                                   │    │
│  │  - /customers.json  - /products.json  - /orders.json                 │    │
│  │  - Webhook Support  - Rate Limiting  - Authentication                │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Shopify       │    │   Xeno Service  │    │   MySQL DB      │
│   Store         │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. API Call           │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 2. Data Response      │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │                       │ 3. Transform & Store  │
         │                       ├──────────────────────►│
         │                       │                       │
         │                       │ 4. Sync Complete      │
         │                       │◄──────────────────────┤
         │                       │                       │
         │                       │ 5. Dashboard Update   │
         │                       ├──────────────────────►│
         │                       │                       │
         │                       │ 6. Real-time Data     │
         │                       │◄──────────────────────┤
```

## Multi-Tenant Data Isolation

```
┌─────────────────────────────────────────────────────────────────┐
│                    Tenant A (Store A)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  customers  │  │  products   │  │   orders    │            │
│  │ tenantId=1  │  │ tenantId=1  │  │ tenantId=1  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Tenant B (Store B)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  customers  │  │  products   │  │   orders    │            │
│  │ tenantId=2  │  │ tenantId=2  │  │ tenantId=2  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Tenant C (Store C)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  customers  │  │  products   │  │   orders    │            │
│  │ tenantId=3  │  │ tenantId=3  │  │ tenantId=3  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Security                         │
├─────────────────────────────────────────────────────────────────┤
│  - JWT Token Storage (localStorage)                            │
│  - HTTPS Only Communication                                    │
│  - Input Validation (Client-side)                              │
│  - XSS Protection                                              │
└─────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTPS
                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Server Security                           │
├─────────────────────────────────────────────────────────────────┤
│  - Helmet.js (Security Headers)                                │
│  - CORS Configuration                                          │
│  - Rate Limiting (express-rate-limit)                          │
│  - JWT Authentication Middleware                               │
│  - Input Validation (Joi)                                      │
│  - Password Hashing (bcryptjs)                                 │
└─────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Encrypted Connection
                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database Security                         │
├─────────────────────────────────────────────────────────────────┤
│  - Connection Encryption (SSL)                                 │
│  - SQL Injection Prevention (Sequelize ORM)                    │
│  - Multi-tenant Data Isolation                                 │
│  - Database User Permissions                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Load Balancer                           │
│                    (Nginx/HAProxy)                             │
└─────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Servers                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Node.js App   │  │   Node.js App   │  │   Node.js App   │ │
│  │   (Instance 1)  │  │   (Instance 2)  │  │   (Instance 3)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database Cluster                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   MySQL Master  │  │   MySQL Slave   │  │   MySQL Slave   │ │
│  │   (Read/Write)  │  │   (Read Only)   │  │   (Read Only)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Component Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Components                     │
├─────────────────────────────────────────────────────────────────┤
│  App.js                                                         │
│  ├── AuthProvider (Context)                                    │
│  ├── Layout (Navigation)                                       │
│  ├── Dashboard (Overview)                                      │
│  ├── Analytics (Charts)                                        │
│  └── Settings (Configuration)                                  │
└─────────────────────────────────────────────────────────────────┘
                                        │
                                        │ API Calls
                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend Services                        │
├─────────────────────────────────────────────────────────────────┤
│  Controllers                                                    │
│  ├── authController (Authentication)                           │
│  ├── tenantController (Tenant Management)                      │
│  ├── syncController (Data Synchronization)                     │
│  └── analyticsController (Data Analytics)                      │
│                                                                 │
│  Services                                                       │
│  ├── shopifyService (Shopify Integration)                      │
│  ├── schedulerService (Background Jobs)                        │
│  └── loggerService (Logging)                                   │
│                                                                 │
│  Models                                                         │
│  ├── Tenant (Multi-tenant)                                     │
│  ├── User (Authentication)                                     │
│  ├── Customer (Shopify Data)                                   │
│  ├── Product (Shopify Data)                                    │
│  ├── Order (Shopify Data)                                      │
│  └── SyncLog (Audit Trail)                                     │
└─────────────────────────────────────────────────────────────────┘
```

## API Design Patterns

```
┌─────────────────────────────────────────────────────────────────┐
│                        REST API Design                         │
├─────────────────────────────────────────────────────────────────┤
│  Authentication:                                                │
│  POST   /api/auth/register                                      │
│  POST   /api/auth/login                                         │
│  GET    /api/auth/profile                                       │
│  PUT    /api/auth/profile                                       │
│                                                                 │
│  Tenant Management:                                             │
│  POST   /api/tenants                                            │
│  GET    /api/tenants                                            │
│  GET    /api/tenants/:id                                        │
│  PUT    /api/tenants/:id                                        │
│                                                                 │
│  Data Synchronization:                                          │
│  POST   /api/sync/:tenantId/customers                          │
│  POST   /api/sync/:tenantId/products                           │
│  POST   /api/sync/:tenantId/orders                             │
│  POST   /api/sync/:tenantId/full                               │
│                                                                 │
│  Analytics:                                                     │
│  GET    /api/analytics/:tenantId/dashboard                     │
│  GET    /api/analytics/:tenantId/customers                     │
│  GET    /api/analytics/:tenantId/orders                        │
│  GET    /api/analytics/:tenantId/products                      │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                      Error Handling Flow                       │
├─────────────────────────────────────────────────────────────────┤
│  1. Client Error (React)                                       │
│     ├── Try/Catch Blocks                                       │
│     ├── Error Boundaries                                       │
│     └── Toast Notifications                                    │
│                                                                 │
│  2. API Error (Express)                                        │
│     ├── Validation Errors (Joi)                                │
│     ├── Authentication Errors (JWT)                            │
│     ├── Business Logic Errors                                  │
│     └── Server Errors (500)                                    │
│                                                                 │
│  3. Database Error (Sequelize)                                 │
│     ├── Connection Errors                                      │
│     ├── Query Errors                                           │
│     ├── Constraint Violations                                  │
│     └── Transaction Rollbacks                                  │
│                                                                 │
│  4. External API Error (Shopify)                               │
│     ├── Rate Limiting                                          │
│     ├── Authentication Failures                                │
│     ├── Network Timeouts                                       │
│     └── Data Validation Errors                                 │
└─────────────────────────────────────────────────────────────────┘
```

This architecture provides a robust, scalable, and secure foundation for the multi-tenant Shopify data ingestion and insights service.
