
const registerData = {
    name: 'Test Auth User',
    email: 'testauth@example.com',
    phone: '9876543210',
    password: 'Password123'
};

const loginData = {
    email: 'admin@gmail.com',
    password: 'admin123'
};

async function runTests() {
    console.log('🚀 Starting Auth API Tests...');

    // 1. Test Registration
    try {
        console.log('\n📝 Testing Registration...');
        const regRes = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        });
        const regJson = await regRes.json();
        if (regRes.ok) {
            console.log('✅ Registration Successful:', regJson.email);
        } else {
            console.error('❌ Registration Failed:', regRes.status, regJson);
        }
    } catch (e) {
        console.error('❌ Registration Error:', e.message);
    }

    // 2. Test Login (Existing Admin)
    try {
        console.log('\n🔑 Testing Admin Login...');
        const logRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        const logJson = await logRes.json();
        if (logRes.ok) {
            console.log('✅ Admin Login Successful:', logJson.email);
        } else {
            console.error('❌ Admin Login Failed:', logRes.status, logJson);
        }
    } catch (e) {
        console.error('❌ Login Error:', e.message);
    }
}

runTests();
