import axios from 'axios';

const testLogin = async () => {
  try {
    console.log('🔄 Testing login API...\n');
    
    const credentials = {
      email: 'jobseeker@demo.com',
      password: 'password123'
    };
    
    console.log('Attempting login with:', credentials.email);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', credentials, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ Login Successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ Login Failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Is the server running on http://localhost:5000?');
    } else {
      console.error('Error:', error.message);
    }
  }
};

testLogin();
