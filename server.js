const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const routes = require('./routes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'views'))); // Serve static files from the views directory
app.use(session({
    secret: 'knowledgebase_secret',
    resave: false,
    saveUninitialized: true
}));

// Routes
app.use('/', routes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
