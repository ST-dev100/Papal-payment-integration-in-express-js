# PayPal Payment Integration in Express

This guide walks you through the steps to integrate PayPal payments into your Express application using the PayPal REST API.

## Prerequisites
1. <b>Node.js and Express</b>: Make sure you have Node.js and Express installed. If not, you can install them with:

       npm install express

2. <b>PayPal Developer Account</b>: Sign up or log in at the PayPal Developer Portal. Create an app under the "My Apps & Credentials" section to obtain your Client ID and Secret.   

3. <b>Install Axios:</b> Axios is required for making HTTP requests to the PayPal API.

        npm install axios

# Steps  

## 1. Set Up Environment Variables
Create a .env file to store your PayPal credentials and base URL for your application:

    PAYPAL_CLIENT_ID=YourClientID
    PAYPAL_SECRET=YourSecret
    PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
    BASE_URL=http://localhost:3000

 ## 2. Create a PayPal Service File   

 Create a file, `paypalService.js`, to handle the logic for creating an access token and an order.

        // paypalService.js
        require('dotenv').config();
        const axios = require('axios');

    const generateAccessToken = async () => {
        const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
        const response = await axios({
            url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${auth}`
            },
            data: 'grant_type=client_credentials'
        });
        return response.data.access_token;
    };

    const createOrder = async () => {
        const accessToken = await generateAccessToken();
        const response = await axios({
            url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            data: {
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: 'USD',
                        value: '100.00'
                    }
                }],
                application_context: {
                    return_url: `${process.env.BASE_URL}/complete-order`,
                    cancel_url: `${process.env.BASE_URL}/cancel-order`
                }
            }
        });
        return response.data;
    };

    module.exports = { createOrder };

## 3. Set Up Express Routes

In your main Express app file, set up routes to create an order and handle order completion and cancellation.

                // app.js
        const express = require('express');
        const { createOrder } = require('./paypalService');
        const app = express();

        app.post('/create-order', async (req, res) => {
            try {
                const order = await createOrder();
                res.json(order);
            } catch (error) {
                res.status(500).send(error.toString());
            }
        });

        app.get('/complete-order', (req, res) => {
            // Handle order completion logic here
            res.send("Order completed successfully!");
        });

        app.get('/cancel-order', (req, res) => {
            res.send("Order was cancelled.");
        });

        app.listen(3000, () => {
            console.log('Server is running on http://localhost:3000');
        });

## 4. Testing the Integration
  1. Start the server:

            bash
            node app.js
 2. Use Postman or another API testing tool to send a POST request to http://localhost:3000/create-order. This should return an object containing an approval URL, which you can use to redirect users to PayPal for payment approval.

3. After users approve the payment, they’ll be redirected to the return_url or cancel_url specified in the request.

# Additional Notes
## Order Capture: 
After the user approves the order, capture the payment by making a request to the /v2/checkout/orders/{order_id}/capture endpoint.

## Error Handling: 
Include error handling for cases where token generation or order creation fails.


