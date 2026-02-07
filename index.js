const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.urlencoded({ extended: true }));

const SHOP_DOMAIN = 'iicqoi-jc.myshopify.com';
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;

app.post('/ussd', async (req, res) => {
    let { text } = req.body;
    let response = "";

    if (text == "") {
        response = `CON Welcome to Teaxy \n 1. View Products \n 2. Check Order Status`;
    } else if (text == "1") {
        try {
            const tokenRes = await axios.post(`https://${SHOP_DOMAIN}/admin/oauth/access_token`, {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'client_credentials'
            });
            const accessToken = tokenRes.data.access_token;

            const productRes = await axios.get(`https://${SHOP_DOMAIN}/admin/api/2024-04/products.json`, {
                headers: { 'X-Shopify-Access-Token': accessToken }
            });
           
            const productList = productRes.data.products.map((p, i) => `${i+1}. ${p.title}`).join('\n');
            response = `CON Choose a Tea: \n${productList}`;
        } catch (err) {
            response = `END Error connecting to shop. Please try again.`;
        }
    }
    res.set('Content-Type', 'text/plain');
    res.send(response);
});

app.listen(process.env.PORT || 3000);
