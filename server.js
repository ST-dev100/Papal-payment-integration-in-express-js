require('dotenv').config()
const express = require('express')
const paypal = require('./services/paypal')

const app = express();

app.get('/',(req,res)=>{
   res.send("hi")
})
app.get('/pay', async(req, res) => { 
    try {
        const url = await paypal.createOrder()

        res.redirect(url)
    } catch (error) {
        res.send('Error: ' + error)
    }
})
app.get('/complete-order', async (req, res) => {
    try {
        
        await paypal.capturePayment(req.query.token)
        res.send('Course purchased successfully')
    } catch (error) {
        res.send('Error: ' + error)
    }
})

app.get('/cancel-order', (req, res) => {
    res.redirect('/')
})
app.listen(3000,()=>{
    console.log("The app is started")
})
