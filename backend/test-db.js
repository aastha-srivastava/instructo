require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    const tables = await sequelize.showAllSchemas();
    console.log('📋 Available schemas:', tables);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

testConnection();
