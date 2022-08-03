const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3333;
require('dotenv').config();

const app = express();

app.use(express.static(path.join('front')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.listen(PORT, () => console.log(`Listening on port ${PORT}`));