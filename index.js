require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

const users = require('./routes/users');
const categories = require('./routes/categories');
const products = require('./routes/products');
const transactions = require('./routes/transactions');
const uploads = require('./routes/uploads');

const prefix = '/api/v1/';
app.use(`${prefix}`, users);
app.use(`${prefix}`, categories);
app.use(`${prefix}`, products);
app.use(`${prefix}`, transactions);
app.use(`${prefix}`, uploads);

const PORT = process.env.NODE_ENV === 'test' ? 8000+Math.floor(Math.random() * 1000) : 8000;
if (process.env.NODE_ENV !== 'test'){
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}
module.exports = app;