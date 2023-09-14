const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const helmet = require('helmet');
const db = require('./models')

// Initialize sequelize session store
const SequelizeStore = require('connect-session-sequelize')(session.Store)

const path = require('path')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3000

const _store = new SequelizeStore({
    db: db.sequelize,
})

_store.sync() // create the table for the Sessions if it doesn't exist

const _sessionOptions = {
    secret: process.env.SESSION_SECRET,
    store: _store,
    resave: false, // we support the touch method so per the express-session docs this should be set to false
    // proxy: true, // if you do SSL outside of node.
    saveUninitialized: true,
    cookie: {
        path: '/',
        secure: true, // serve secure cookies
    },
}

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1) // trust first proxy
}

app.use(session(_sessionOptions))

const routes = require('./routes/index')
const customRoutes = require('./routes/custom-routes')

// TODO: We need to configure cors to only accept request from some domains.
app.use(cors())

app.use(helmet());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json()) // TODO: do we wanna use .json by default and like this?
app.use(express.static(path.join(__dirname, 'views'))) // Serve static files from the views directory

// Routes
app.use('/', [routes, customRoutes])

app.use(function (req, res) {
    // check the url they navigated to that got them lost, and try to offer suggestions in the front end that'll match why they got lost... maybe they missed a letter in their statecode url
    res.status(404).send({ message: 'Hey, that URL/endpoint does not exist.' })
})

// Start the server
app.listen(PORT, () => {
    console.log(
        `Server is running on http://localhost:${PORT} in %s mode`,
        process.env.NODE_ENV
    )
})
