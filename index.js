const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.urlencoded({ extended: true }));

// These will be pulled from your Render Environment Variables
const SHOP_DOMAIN = process.env.SHOP_DOMAIN || 'iicq0i-jc.myshopify.com';
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

app.post('/ussd', async (req, res) => {
    let { text } = req.body;
    let response = "";

    if (text === "") {

        response = `CON Welcome to Teaxy \n 1. View Products \n 2. Check Order Status`;
    } else if (text === "1") {
        try {
            // 1. Get Access Token
            const tokenRes = await axios.post(`https://${SHOP_DOMAIN}/admin/oauth/access_token`, {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'client_credentials'
            });

            const accessToken = tokenRes.data.access_token;

            // 2. Fetch Products using the token
            const productRes = await axios.get(`https://${SHOP_DOMAIN}/admin/api/2025-01/products.json`, {

                headers: { 'X-Shopify-Access-Token': accessToken }
            });

            const products = productRes.data.products;
            const productList = products.map((p, i) => `${i + 1}. ${p.title}`).join('\n');
            
            response = `CON Choose a Tea: \n${productList}`;

        } catch (err) {
            console.error("Shopify Error:", err.response ? err.response.data : err.message);
            response = `END Error connecting to shop. Please try again.`;
        }
    } else {

        response = `END Invalid option.`;
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

