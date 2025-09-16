# Xeno Deployment Guide

## 🚀 Production Deployment

This guide covers deploying the Xeno Shopify Data Ingestion & Insights Service to production environments.

## Prerequisites

- Node.js 18+ installed
- MySQL 8.0+ database
- Domain name and SSL certificate
- Server with at least 2GB RAM and 2 CPU cores
- Git installed

## Environment Setup

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
sudo apt install nginx -y
```

### 2. Database Setup

```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
CREATE DATABASE xeno_shopify;
CREATE USER 'xeno_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON xeno_shopify.* TO 'xeno_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Application Deployment

```bash
# Clone repository
git clone <repository-url>
cd xeno-shopify-service

# Install dependencies
npm install

# Install client dependencies
cd client
npm install
npm run build
cd ..

# Set up environment variables
cp env.example .env
nano .env
```

### 4. Environment Configuration

```env
# Production Environment Variables
NODE_ENV=production
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=xeno_shopify
DB_USER=xeno_user
DB_PASSWORD=secure_password

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_EXPIRES_IN=7d

# Shopify Configuration
SHOPIFY_API_VERSION=2023-10
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret

# Client URL
CLIENT_URL=https://yourdomain.com

# Logging
LOG_LEVEL=info
```

### 5. Database Migration

```bash
# Run database migrations
npm run db:migrate

# Optional: Seed initial data
npm run db:seed
```

## PM2 Process Management

### 1. Create PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'xeno-backend',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### 2. Start Application

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### 3. PM2 Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs xeno-backend

# Restart application
pm2 restart xeno-backend

# Stop application
pm2 stop xeno-backend

# Monitor
pm2 monit
```

## Nginx Configuration

### 1. Create Nginx Configuration

Create `/etc/nginx/sites-available/xeno`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Client (React App)
    location / {
        root /path/to/your/app/client/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Enable Site

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/xeno /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## SSL Certificate Setup

### Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Logging

### 1. Log Management

```bash
# Create logs directory
mkdir -p logs

# Set up log rotation
sudo nano /etc/logrotate.d/xeno
```

```bash
/path/to/your/app/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 2. Health Monitoring

Create `health-check.js`:

```javascript
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('Health check passed');
    process.exit(0);
  } else {
    console.log('Health check failed');
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.log('Health check error:', err);
  process.exit(1);
});

req.end();
```

### 3. Monitoring Script

Create `monitor.sh`:

```bash
#!/bin/bash
cd /path/to/your/app
node health-check.js
if [ $? -ne 0 ]; then
    pm2 restart xeno-backend
    echo "$(date): Application restarted" >> logs/monitor.log
fi
```

```bash
# Make executable
chmod +x monitor.sh

# Add to crontab
crontab -e
# Add: */5 * * * * /path/to/your/app/monitor.sh
```

## Backup Strategy

### 1. Database Backup

Create `backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="xeno_shopify"

mkdir -p $BACKUP_DIR

mysqldump -u xeno_user -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/xeno_shopify_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "xeno_shopify_*.sql" -mtime +30 -delete

echo "$(date): Database backup completed" >> $BACKUP_DIR/backup.log
```

### 2. Application Backup

```bash
# Create application backup script
cat > backup-app.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/path/to/backups"
APP_DIR="/path/to/your/app"
DATE=$(date +%Y%m%d_%H%M%S)

tar -czf $BACKUP_DIR/xeno_app_$DATE.tar.gz -C $APP_DIR \
    --exclude=node_modules \
    --exclude=logs \
    --exclude=.git \
    .

# Keep only last 7 days
find $BACKUP_DIR -name "xeno_app_*.tar.gz" -mtime +7 -delete
EOF

chmod +x backup-app.sh
```

## Security Hardening

### 1. Firewall Configuration

```bash
# Install UFW
sudo apt install ufw -y

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Database Security

```sql
-- Remove anonymous users
DELETE FROM mysql.user WHERE User='';

-- Remove test database
DROP DATABASE IF EXISTS test;

-- Set root password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'strong_root_password';

-- Create application user with limited privileges
CREATE USER 'xeno_user'@'localhost' IDENTIFIED BY 'strong_app_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON xeno_shopify.* TO 'xeno_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Application Security

```bash
# Set proper file permissions
chmod 600 .env
chmod 755 server/
chmod 755 client/build/

# Create non-root user for application
sudo useradd -r -s /bin/false xeno
sudo chown -R xeno:xeno /path/to/your/app
```

## Performance Optimization

### 1. Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_customers_tenant_shopify ON customers(tenant_id, shopify_id);
CREATE INDEX idx_orders_tenant_created ON orders(tenant_id, created_at);
CREATE INDEX idx_products_tenant_shopify ON products(tenant_id, shopify_id);

-- Optimize MySQL configuration
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

```ini
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
query_cache_size = 64M
query_cache_type = 1
max_connections = 200
```

### 2. Application Optimization

```bash
# Enable gzip compression in Nginx
sudo nano /etc/nginx/nginx.conf
```

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

## Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check logs
   pm2 logs xeno-backend
   
   # Check environment variables
   pm2 env xeno-backend
   ```

2. **Database connection issues**
   ```bash
   # Test database connection
   mysql -u xeno_user -p xeno_shopify
   
   # Check MySQL status
   sudo systemctl status mysql
   ```

3. **Nginx configuration errors**
   ```bash
   # Test configuration
   sudo nginx -t
   
   # Check error logs
   sudo tail -f /var/log/nginx/error.log
   ```

### Health Checks

```bash
# Application health
curl http://localhost:5000/health

# Database health
mysql -u xeno_user -p -e "SELECT 1"

# Nginx health
curl -I https://yourdomain.com
```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**: Use HAProxy or Nginx for load balancing
2. **Database Replication**: Set up MySQL master-slave replication
3. **Session Storage**: Use Redis for session storage
4. **File Storage**: Use cloud storage (S3, GCS) for static files

### Vertical Scaling

1. **Increase Server Resources**: More CPU, RAM, storage
2. **Database Optimization**: Better hardware, SSD storage
3. **Caching**: Implement Redis caching layer
4. **CDN**: Use CloudFlare or AWS CloudFront

## Maintenance

### Regular Tasks

1. **Daily**: Check application logs and health
2. **Weekly**: Review performance metrics
3. **Monthly**: Update dependencies and security patches
4. **Quarterly**: Review and optimize database performance

### Update Process

```bash
# Backup current version
./backup-app.sh

# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Run migrations
npm run db:migrate

# Restart application
pm2 restart xeno-backend

# Verify deployment
curl http://localhost:5000/health
```

This deployment guide provides a comprehensive approach to deploying the Xeno service in a production environment with proper security, monitoring, and maintenance procedures.
