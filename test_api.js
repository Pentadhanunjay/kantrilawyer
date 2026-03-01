
// Native fetch in Node 22

async function testApi() {
    try {
        const res = await fetch('http://localhost:3000/api/data?type=courses');
        const data = await res.json();
        console.log('API Status: OK');
        console.log('Courses count:', data.length);
        console.log('First course:', data[0]?.title);
    } catch (e) {
        console.error('API Error:', e.message);
    }
}

testApi();
