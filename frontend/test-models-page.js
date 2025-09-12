/**
 * Simple test script to check if the models page is accessible
 */

const axios = require('axios');

async function testModelsPage() {
  try {
    console.log('Testing frontend models page...');
    
    // Test if frontend server is running
    const response = await axios.get('http://localhost:3000/settings/models', {
      timeout: 5000,
      validateStatus: function (status) {
        return status < 500; // Accept any status code less than 500
      }
    });
    
    console.log(`✅ Frontend server responding: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Models page is accessible');
      console.log(`📄 Page content length: ${response.data.length} characters`);
      
      // Check if the page contains expected elements
      const content = response.data;
      const checks = [
        { name: 'AI Models title', pattern: /AI Models|模型配置/ },
        { name: 'Add Model button', pattern: /Add Model|添加模型/ },
        { name: 'Table component', pattern: /<table|Table/ },
        { name: 'React components', pattern: /react|React/ }
      ];
      
      checks.forEach(check => {
        if (check.pattern.test(content)) {
          console.log(`✅ ${check.name} found`);
        } else {
          console.log(`❌ ${check.name} not found`);
        }
      });
      
    } else if (response.status === 404) {
      console.log('❌ Models page not found (404)');
    } else {
      console.log(`⚠️  Unexpected status: ${response.status}`);
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Frontend server is not running');
      console.log('   Please start with: npm run dev');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('❌ Request timed out');
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

// Run the test
testModelsPage();