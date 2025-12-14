import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const testConnection = async () => {
  try {
    console.log('🔄 Testing MongoDB Atlas connection...\n');
    console.log('Connection String:', process.env.MONGODB_URI.replace(/admin:admin/, 'admin:****'));
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n✅ MongoDB Atlas Connected Successfully!');
    console.log('📍 Host:', mongoose.connection.host);
    console.log('📊 Database:', mongoose.connection.name);
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📦 Collections in database:');
    
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`   - ${collection.name}: ${count} documents`);
    }
    
    // Check users
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\n👥 Users in database:');
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    // Check jobs
    const jobs = await mongoose.connection.db.collection('jobpostings').find({}).toArray();
    console.log(`\n💼 Job Postings: ${jobs.length} total`);
    jobs.slice(0, 3).forEach(job => {
      console.log(`   - ${job.title} at ${job.company}`);
    });
    
    console.log('\n✨ Database is ready to use!');
    
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MongoDB Connection Error:');
    console.error('Error Message:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('\n⚠️  Authentication Issue: Check your username and password');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('\n⚠️  Network Issue: Cannot reach MongoDB Atlas');
      console.error('   - Check your internet connection');
      console.error('   - Verify the cluster URL is correct');
    } else if (error.message.includes('IP')) {
      console.error('\n⚠️  IP Whitelist Issue: Your IP may not be allowed');
      console.error('   - Go to MongoDB Atlas → Network Access');
      console.error('   - Add your current IP or allow access from anywhere (0.0.0.0/0)');
    }
    
    process.exit(1);
  }
};

testConnection();
