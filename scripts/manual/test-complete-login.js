import axios from 'axios';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const testCompleteLogin = async () => {
  try {
    console.log('🔄 Running complete login test...\n');

    // Step 1: Connect to database and check user
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 2: Check if user exists in database
    const userCollection = mongoose.connection.collection('users');
    const userFromDB = await userCollection.findOne({ email: 'jobseeker@demo.com' });
    
    if (!userFromDB) {
      console.error('❌ User not found in database!');
      process.exit(1);
    }
    
    console.log('✅ User found in database:');
    console.log('   Email:', userFromDB.email);
    console.log('   Name:', userFromDB.name);
    console.log('   Role:', userFromDB.role);
    console.log('   Has password hash:', !!userFromDB.password);
    console.log('   Is active:', userFromDB.isActive);
    
    // Step 3: Test password comparison
    console.log('\n🔐 Testing password verification...');
    console.log('   Password hash from DB:', userFromDB.password.substring(0, 20) + '...');
    const isPasswordValid = await bcrypt.compare('password123', userFromDB.password);
    console.log('   Password "password123" is valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.error('\n❌ Password does not match! The seeded password may be incorrect.');
      await mongoose.connection.close();
      process.exit(1);
    }
    
    await mongoose.connection.close();
    
    // Step 4: Test API endpoint
    console.log('\n📡 Testing API endpoint...');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'jobseeker@demo.com',
        password: 'password123'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      console.log('\n✅ LOGIN SUCCESSFUL!');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      
    } catch (apiError) {
      console.error('\n❌ API call failed!');
      if (apiError.response) {
        console.error('Status:', apiError.response.status);
        console.error('Response:', JSON.stringify(apiError.response.data, null, 2));
      } else if (apiError.request) {
        console.error('No response from server. Server may not be running.');
        console.error('Make sure server is running on http://localhost:5000');
      } else {
        console.error('Error:', apiError.message);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
};

testCompleteLogin();
