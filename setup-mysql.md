# MySQL Setup Guide for Xeno

## Prerequisites
- MySQL 8.0+ installed
- MySQL service running

## Step 1: Install MySQL (if not installed)

### Windows:
1. Download MySQL Installer from https://dev.mysql.com/downloads/installer/
2. Run the installer and follow the setup wizard
3. Set root password during installation
4. Start MySQL service

### macOS:
```bash
brew install mysql
brew services start mysql
```

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

## Step 2: Create Database and User

1. Open MySQL command line or MySQL Workbench
2. Run these commands:

```sql
-- Create database
CREATE DATABASE xeno_shopify;

-- Create user (replace 'your_password' with a strong password)
CREATE USER 'xeno_user'@'localhost' IDENTIFIED BY 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON xeno_shopify.* TO 'xeno_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES;
```

## Step 3: Update Environment Variables

Update your `.env` file with the correct MySQL credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=xeno_shopify
DB_USER=xeno_user
DB_PASSWORD=your_password
```

## Step 4: Test Connection

Run the setup script:
```bash
npm run setup-shopify
```

## Troubleshooting

### Connection Refused Error:
- Make sure MySQL service is running
- Check if MySQL is listening on port 3306
- Verify username and password

### Access Denied Error:
- Check if user has correct privileges
- Verify database name exists
- Check if user can connect from localhost

### Port Already in Use:
- Check if another MySQL instance is running
- Change port in configuration if needed
