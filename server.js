const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const routes = require('./routes/index');
const customRoutes = require('./routes/custom-routes')

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'views'))); // Serve static files from the views directory
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Routes
app.use('/', [routes, customRoutes]);

app.use(function (req, res) {
    // check the url they navigated to that got them lost, and try to offer suggestions in the front end that'll match why they got lost... maybe they missed a letter in their statecode url
    res.status(404).send({ message: 'Hey, that URL/endpoint does not exist.' })
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} in %s mode`, process.env.NODE_ENV);
});
