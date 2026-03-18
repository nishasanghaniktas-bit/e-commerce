const axios = require('axios');
const { config } = require('./config/env');

async function testLogin() {
    try {
        console.log("Testing with nisha.sanghani.ktas@gmail.com / nishaktas");
        const res = await axios.post(`${config.apiBaseUrl}/api/auth/login`, {
            email: 'nisha.sanghani.ktas@gmail.com',
            password: 'nishaktas'
        });
        console.log("Success:", res.data.user.email, res.data.user.role);
    } catch (err) {
        console.log("Error Status:", err.response?.status);
        console.log("Error Data:", err.response?.data);
    }
}

testLogin();
