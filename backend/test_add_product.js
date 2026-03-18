const axios = require('axios');
const { config } = require('./config/env');

async function testAddProduct() {
    try {
        const token = 'eyJhbGciOiJIUzI1NiIsIn...'; // I need a real token or I can use the dev bypass if it was for all roles
        // Wait, I can just use the dev login to get a token
        const loginRes = await axios.post(`${config.apiBaseUrl}/api/auth/login`, {
            email: 'admin@mobilesale.com',
            password: 'admin123'
        });
        const tokenHeader = { Authorization: `Bearer ${loginRes.data.token}` };

        const productData = {
            name: "Test Phone " + Date.now(),
            category: "Smartphones",
            price: 999,
            stock: 50,
            description: "Test description",
            image: "https://images.meesho.com/images/products/619459773/sxpwn_512.avif?width=512"
        };

        const res = await axios.post(`${config.apiBaseUrl}/api/products`, productData, { headers: tokenHeader });
        console.log("Success:", res.data);
    } catch (err) {
        console.log("Error Status:", err.response?.status);
        console.log("Error Data:", err.response?.data);
    }
}

testAddProduct();
