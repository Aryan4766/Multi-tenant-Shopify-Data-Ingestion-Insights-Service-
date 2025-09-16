#!/usr/bin/env node

require('dotenv').config();
const { sequelize } = require('./server/models');
const { testShopifyConnection, createDemoTenant, createDemoUsers } = require('./server/scripts/setup-demo-tenant');

async function main() {
  try {
    console.log('🚀 Setting up Xeno with your Shopify store...\n');
    
    // Test database connection
    console.log('🔍 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Test Shopify connection
    const shopInfo = await testShopifyConnection();
    
    // Create tenant
    const tenant = await createDemoTenant(shopInfo);
    
    // Create users
    await createDemoUsers(tenant.id);
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the application: npm run dev');
    console.log('2. Open http://localhost:3000');
    console.log('3. Login with: admin@xeno.com / admin123');
    console.log('4. Go to Dashboard and click "Full Sync" to fetch real data');
    console.log('\n🔗 Your Shopify store: https://xenofdeteststore.myshopify.com');
    
  } catch (error) {
    console.error('\n💥 Setup failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();
