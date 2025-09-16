# Xeno - Multi-tenant Shopify Data Ingestion & Insights Service

A comprehensive multi-tenant platform that helps enterprise retailers onboard, integrate, and analyze their customer data from Shopify stores.

## 🚀 Features

### Core Functionality
- **Multi-tenant Architecture**: Isolated data storage and processing for multiple Shopify stores
- **Real-time Data Ingestion**: Automated synchronization of customers, products, and orders
- **Advanced Analytics Dashboard**: Interactive charts and insights for business performance
- **User Authentication**: Secure role-based access control
- **Scheduled Synchronization**: Automated data sync with configurable intervals

### Data Sources
- **Customers**: Complete customer profiles with spending analytics
- **Products**: Product catalog with performance metrics
- **Orders**: Order history with financial and fulfillment status
- **Order Items**: Detailed line item analysis

### Analytics & Insights
- **Dashboard Overview**: Key metrics and KPIs
- **Customer Analytics**: Acquisition trends, spending patterns, customer segmentation
- **Order Analytics**: Order trends, status distribution, revenue analysis
- **Product Analytics**: Performance metrics, sales trends, inventory insights
- **Interactive Charts**: Line charts, bar charts, pie charts, scatter plots

## 🏗️ Architecture

### Backend (Node.js + Express)
- **API Layer**: RESTful APIs with JWT authentication
- **Data Layer**: MySQL with Sequelize ORM for multi-tenant data isolation
- **Integration Layer**: Shopify API client with rate limiting and error handling
- **Scheduler**: Automated sync jobs using node-cron
- **Security**: Helmet, CORS, rate limiting, input validation

### Frontend (React)
- **Dashboard**: Real-time analytics with Recharts
- **Authentication**: JWT-based login/registration
- **State Management**: React Query for server state
- **UI Components**: Tailwind CSS with custom design system
- **Responsive Design**: Mobile-first approach

### Database Schema
```
tenants (Multi-tenant isolation)
├── users (Tenant users)
├── customers (Shopify customers)
├── products (Shopify products)
├── orders (Shopify orders)
├── order_items (Order line items)
└── sync_logs (Synchronization history)
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL 8.0+
- **ORM**: Sequelize
- **Authentication**: JWT + bcryptjs
- **Scheduling**: node-cron
- **Logging**: Winston
- **Validation**: Joi

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **State Management**: React Query
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### DevOps
- **Process Management**: PM2
- **Environment**: dotenv
- **CORS**: Cross-origin resource sharing
- **Security**: Helmet.js

## 📦 Installation

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Backend Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run db:migrate

# Start the server
npm run server
```

### Frontend Setup
```bash
cd client

# Install dependencies
npm install

# Start the development server
npm start
```

### Database Setup
```sql
-- Create database
CREATE DATABASE xeno_shopify;

-- Run migrations
npm run db:migrate
```

## 🔧 Configuration

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=xeno_shopify
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# Shopify
SHOPIFY_API_VERSION=2023-10
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret

# Frontend
CLIENT_URL=http://localhost:3000
```

## 🚀 Usage

### 1. Tenant Onboarding
1. Create a tenant with Shopify store credentials
2. Add users to the tenant
3. Configure sync settings

### 2. Data Synchronization
- **Manual Sync**: Trigger sync from dashboard
- **Scheduled Sync**: Automatic sync every 6 hours
- **Real-time Sync**: Webhook-based updates (optional)

### 3. Analytics Dashboard
- View key metrics and KPIs
- Analyze customer behavior
- Track product performance
- Monitor order trends

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Tenants
- `POST /api/tenants` - Create tenant
- `GET /api/tenants` - List tenants (admin only)
- `GET /api/tenants/:id` - Get tenant details
- `PUT /api/tenants/:id` - Update tenant
- `GET /api/tenants/:id/users` - Get tenant users
- `POST /api/tenants/:id/users` - Create tenant user

### Synchronization
- `POST /api/sync/:tenantId/customers` - Sync customers
- `POST /api/sync/:tenantId/products` - Sync products
- `POST /api/sync/:tenantId/orders` - Sync orders
- `POST /api/sync/:tenantId/full` - Full sync
- `GET /api/sync/:tenantId/status` - Get sync status

### Analytics
- `GET /api/analytics/:tenantId/dashboard` - Dashboard stats
- `GET /api/analytics/:tenantId/customers` - Customer analytics
- `GET /api/analytics/:tenantId/orders` - Order analytics
- `GET /api/analytics/:tenantId/products` - Product analytics

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Joi validation for all inputs
- **CORS Protection**: Configured CORS policies
- **SQL Injection Prevention**: Sequelize ORM protection
- **XSS Protection**: Helmet.js security headers

## 📈 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: MySQL connection pooling
- **Caching**: React Query for client-side caching
- **Pagination**: Efficient data pagination
- **Lazy Loading**: Component-based code splitting

## 🚀 Deployment

### Production Checklist
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment-Specific Configurations
- **Development**: Hot reload, detailed logging
- **Staging**: Production-like with test data
- **Production**: Optimized performance, security hardening

## 🔄 Data Synchronization

### Sync Types
1. **Full Sync**: Complete data refresh
2. **Incremental Sync**: Only new/updated records
3. **Selective Sync**: Specific data types

### Sync Schedule
- **Customers**: Every 12 hours
- **Products**: Every 12 hours
- **Orders**: Every hour
- **Full Sync**: Every 6 hours

### Error Handling
- Retry mechanism for failed syncs
- Detailed error logging
- Notification system for sync failures

## 📊 Monitoring & Logging

### Logging
- **Winston Logger**: Structured logging
- **Log Levels**: Error, warn, info, debug
- **Log Rotation**: Automatic log file rotation
- **Error Tracking**: Detailed error context

### Metrics
- Sync success/failure rates
- API response times
- Database query performance
- User activity tracking

## 🧪 Testing

### Backend Testing
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### Frontend Testing
```bash
cd client
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

### Planned Features
- [ ] Real-time webhooks
- [ ] Advanced reporting
- [ ] Data export functionality
- [ ] Custom dashboard widgets
- [ ] Mobile application
- [ ] API rate limiting per tenant
- [ ] Data retention policies
- [ ] Advanced analytics (ML insights)

### Technical Improvements
- [ ] Microservices architecture
- [ ] Redis caching layer
- [ ] Message queue system
- [ ] GraphQL API
- [ ] Real-time notifications
- [ ] Advanced security features

---

**Built with ❤️ for enterprise retailers**
