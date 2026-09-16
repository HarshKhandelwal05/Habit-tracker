const express = require('express');
const path = require('path');
const dashboardRoutes = require('./routes/dashboardRoutes');
const habitRoutes = require('./routes/habitRoutes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/', dashboardRoutes);
app.use('/', habitRoutes);

module.exports = app;
