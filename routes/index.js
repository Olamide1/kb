const express = require('express')
const fs = require('fs')
const bcrypt = require('bcrypt')
const app = express()
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const router = express.Router()
const session = require('express-session')
const bodyParser = require('body-parser')
const differenceInDays = require('date-fns/differenceInDays')

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const usersFilePath = path.join(__dirname, '..', 'data', 'users.json')
const articlesFilePath = path.join(__dirname, '..', 'data', 'articles.json')

// Load the JSON data using the paths
const users = require(usersFilePath)
const articles = require(articlesFilePath)

app.use(
    session({
        // ... other session options
        secret: 'secret_login!@',
        resave: true,
        saveUninitialized: false, // <-- Set this option explicitly
        cookie: {
            sameSite: 'none',
            secure: true,
            maxAge: 3600000, // 1 hour in milliseconds
        },
    })
)

function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next() // User is authenticated, proceed to the next middleware or route handler
    }
    // If not authenticated, store the original URL to redirect after login
    req.session.originalUrl = req.originalUrl
    res.redirect('/login')
}

const colorOptions = [
    { value: '#3273dc', name: 'Blue' },
    { value: '#23d160', name: 'Green' },
    { value: '#ff3860', name: 'Pink' },
    { value: '#ffdd57', name: 'Yellow' },
    { value: '#9d65c9', name: 'Purple' },
]

const saltRounds = 10

// Putting here so we only have to do this once.
const billingsPath = path.join(__dirname, '..', 'data', 'billings.json')
const billings = JSON.parse(fs.readFileSync(billingsPath, 'utf8')) // returns an array.

// Serve static files
app.use(express.static(path.join(__dirname, 'public')))

// Landing page route
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'layout.html'))
})

// GET route for the registration page
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'register.html'))
})

// Define a route for the pricing page
router.get('/pricing', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'pricing.html')) // Change the path as needed
})

// POST route for registration
router.post('/register', (req, res) => {
    const { email, password, company } = req.body

    // Check if email or company already exist
    const users = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, '..', 'data', 'users.json'),
            'utf8'
        )
    )
    const existingUser = users.find(
        (user) => user.email === email || user.company === company
    )

    if (existingUser) {
        return res.send(`
            <html>
                <head>
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
                    <title>Registration Error</title>
                </head>
                <body>
                    <!-- ... Navbar ... -->
                    <section class="section">
                        <div class="container">
                            <div class="notification is-danger">
                                <p>An account with the provided email or company name already exists. Please contact your company administrator for assistance.</p>
                            </div>
                            <a href="/register" class="button is-primary">Try Again</a>
                        </div>
                    </section>
                    <!-- ... End of existing HTML ... -->
                </body>
            </html>
        `)
    }

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            return res.status(500).send('Error hashing password.')
        }

        const newUser = { email, password: hashedPassword, company }
        users.push(newUser)

        fs.writeFileSync(
            path.join(__dirname, '..', 'data', 'users.json'),
            JSON.stringify(users)
        )

        // Include billing and trial information
        const trialDays = 7 // Replace with your trial duration
        const trialEndDate = new Date()
        trialEndDate.setDate(trialEndDate.getDate() + trialDays)

        // Redirect with a success message and billing information
        res.send(`
            <html>
                <head>
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
                    <title>Registration Success</title>
                </head>
                <body>
                    <!-- ... Navbar ... -->
                    <section class="section">
                        <div class="container">
                            <div class="notification is-success">
                                <p>Your account has been set up, please login to continue.</p>
                            </div>
                            <a href="/login" class="button is-primary">Login</a>
                        </div>
                    </section>
                    <!-- Billing and Trial Information -->
                   
                    <!-- ... End of existing HTML ... -->
                </body>
            </html>
        `)
    })
})

// GET route for the login page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'login.html'))
})

// POST route for login
router.post('/login', (req, res) => {
    const { email, password } = req.body

    // TODO: should ideally be async.
    const users = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, '..', 'data', 'users.json'),
            'utf8'
        )
    )
    const user = users.find((u) => u.email === email)

    if (!user) {
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
                <style>
                    /* ... Additional styles ... */
                </style>
            </head>
            <body>
                <!-- Navbar -->
                <nav class="navbar is-white" role="navigation" aria-label="main navigation">
                    <div class="navbar-brand">
                        <a class="navbar-item" href="/">
                            <strong>Yōsei</strong>
                        </a>
                    </div>
                </nav>
                <!-- End of Navbar -->
                <!-- Existing HTML -->
                <section class="section">
                    <div class="container">
                        <div class="notification is-danger">
                            <p>User not found. Please check your email and try again or register an account.</p>
                        </div>
                        <a href="/login" class="button is-primary">Try Again</a>
                    </div>
                </section>
                <!-- End of Existing HTML -->
                <!-- Additional scripts -->
                <script>
                /* Add this to your existing CSS */
                    .hidden {
                        display: none;
                    }
                /* ... Additional scripts ... */
                </script>
            </body>
            </html>
        `)
    }

    bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
            return res.status(500).send('Error verifying password.')
        }

        if (result) {
            req.session.user = user

            // Check if the user is on a paid plan

            /**
             * Find out if they have payment history.
             * Get the last date they paid.
             * Then check if that date is within the current payment cycle,
             * Or if their subscription has expired, and they need to pay again.
             *
             * TODO: maybe even move this whole payment logic to a stand alone service.
             */

            const userPreviousPayments = billings
                .filter(
                    (billing) =>
                        billing?.user === user.email &&
                        parseFloat(billing?.amount) > 0
                )
                .sort(
                    // sort date in ascending order...
                    (a, b) => a.date > b.date
                )

            let isPayingCustomer = false
            if (userPreviousPayments.length > 0) {
                isPayingCustomer = true
            } else {
                // TODO: specify if the user has passed trial period or not.
            }

            // We only need to do this, if they're like new customers/users.
            // Include billing and trial information
            const trialDays = 7 // Replace with your trial duration
            const trialEndDate = new Date()
            trialEndDate.setDate(trialEndDate.getDate() + trialDays)

            // Calculate next payment due date (30 days from the last payment)
            const lastPaymentDate = isPayingCustomer
                ? new Date(
                      userPreviousPayments[userPreviousPayments.length - 1].date
                  )
                : null

            // if lastPaymentDate is less than 30 days (from today), we're good. Else, they're owing us.
            let isUserOwingUs = false
            if (
                lastPaymentDate &&
                differenceInDays(new Date(), lastPaymentDate) > 30
            ) {
                isUserOwingUs = true
            }

            const nextPaymentDueDate = lastPaymentDate
                ? new Date(lastPaymentDate.getTime() + 30 * 24 * 60 * 60 * 1000)
                : null

            /**
             * TODO: check if they've passed their trial period.
             * What should we do if they don't pay? Should we have a grace period? If yes, for how long?
             */
            // Include billing and trial information.
            const billingSection = `
                <section class="section">
                    <div class="container">
                        <div class="billing-info">
                            ${
                                isPayingCustomer && isUserOwingUs
                                    ? `
                                <p>You are on a paid plan. But you're behind payment.</p>
                                `
                                    : isPayingCustomer
                                    ? `
                                <p>You are on a paid plan. Next payment due on: ${nextPaymentDueDate.toDateString()}</p>
                                `
                                    : `
                                <p>Your free trial ends on: ${trialEndDate.toDateString()}</p>
                                <a href="/payment" class="button is-primary">Upgrade to Paid Plan</a>
                                `
                            }
                        </div>
                    </div>
                </section>
            `
            req.session.save((err) => {
                if (err) {
                    console.error('Error saving session:', err)
                    return res.status(500).send('Internal Server Error')
                }

                const articles = JSON.parse(
                    fs.readFileSync(
                        path.join(__dirname, '..', 'data', 'articles.json'),
                        'utf8'
                    )
                )
                const userArticles = articles.filter(
                    (article) => article.email === user.email
                )
                // Include analytics
                const totalArticles = userArticles.length
                let totalCentralViews = 0
                let totalArticleViews = 0

                userArticles.forEach((article) => {
                    totalCentralViews += article.centralViews || 0
                    totalArticleViews += article.articleViews || 0
                })
                // Read total page views from JSON file
                const pageViewsPath = path.join(
                    __dirname,
                    '..',
                    'data',
                    'page-views.json'
                )
                const pageViewsData = JSON.parse(
                    fs.readFileSync(pageViewsPath, 'utf8')
                )

                let articlesHtml = userArticles
                    .map((article) => {
                        let content = article.content
                        let seeMore = false

                        if (content.split(' ').length > 500) {
                            content =
                                content.split(' ').slice(0, 100).join(' ') +
                                '...'
                            seeMore = true
                        }

                        return `
                            <div class="box mb-4">
                                <h3 class="title is-4">${article.title}</h3>
                                <p>${content}</p>
                                <div class="buttons">
                                    ${
                                        seeMore
                                            ? '<a href="#" class="button is-link">See More</a>'
                                            : ''
                                    }
                                    <a href="/edit-article/${
                                        article.id
                                    }" class="button is-warning">Edit</a>
                                    <a href="/delete-article/${
                                        article.id
                                    }" class="button is-danger">Delete</a>
                                </div>
                            </div>
                        `
                    })
                    .join('')

                res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
                        <style>
                            /* ... Additional styles ... */
                        </style>
                    </head>
                    <body>
                        <!-- Navbar -->
                        <nav class="navbar is-white" role="navigation" aria-label="main navigation">
                            <div class="navbar-brand">
                                <a class="navbar-item" href="/dashboard">
                                    <strong>Yōsei</strong>
                                </a>
                                <!-- Mobile Navbar Burger -->
                                <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarMenu">
                                    <span aria-hidden="true"></span>
                                    <span aria-hidden="true"></span>
                                    <span aria-hidden="true"></span>
                                </a>
                            </div>
                            <div class="navbar-menu">
                            <div class="navbar-end">
                                <div class="navbar-item has-dropdown is-hoverable">
                                    <a class="navbar-link">
                                        ${req.session.user.company}
                                    </a>
                                    <div class="navbar-dropdown">
                                        <a class="navbar-item" href="/settings">Settings</a>
                                        <a class="navbar-item" href="/help">Help</a>
                                        <a class="navbar-item" href="/billing">Billing information</a>

                                        <hr class="navbar-divider">
                                        <a class="navbar-item" href="/logout">Logout</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </nav>
                        <!-- End of Navbar -->
                        <!-- Existing HTML -->
                        <section class="section">
                            <div class="container">
                                <h1 class="title is-2 mb-6">Welcome, ${
                                    user.company
                                }!</h1>
                                <div class="box mt-6 notion-inspired">
                                <h3 class="title is-4">Analytics</h3>
                                <div class="columns">
                                
                                    <div class="column">
                                        <div class="notification">
                                            <p class="title is-6">Total Articles</p>
                                            <p class="subtitle">${totalArticles}</p>
                                        </div>
                                    </div>
                                    <div class="column">
                                        <div class="notification">
                                            <p class="title is-6">Total Article Views</p>
                                            <p class="subtitle">${totalArticleViews}</p>
                                        </div>
                                    </div>
                                    
                
                                </div>
                            </div>
                                <div class="buttons mb-6">
                                    <a href="/create-article" class="button is-primary">Create New Article</a>
                                    <a href="/share-knowledgebase" class="button is-link">Share Yōsei</a>     
                                </div>
                                ${
                                    articlesHtml ||
                                    '<p>You have no articles yet. Create one to get started!</p>'
                                }

                                <!-- Include billing and trial information -->
                                <script>
                                document.addEventListener('DOMContentLoaded', () => {
                                    const billingInfo = document.querySelector('.billing-info');
                                    const billingHeader = document.createElement('h3');
                                    billingHeader.className = 'billing-header';
                                    billingHeader.textContent = 'Billing Information';
                                    billingHeader.style.cursor = 'pointer';
                                    billingInfo.parentElement.insertBefore(billingHeader, billingInfo);
                    
                                    billingHeader.addEventListener('click', () => {
                                        billingInfo.classList.toggle('hidden');
                                    });
                                });
                            </script>
                    
                            ${billingSection}
                                    </div>
                                </section>
                                <!-- End of billing and trial information -->
                            </div>
                        </section>
                        <!-- End of Existing HTML -->
                        <!-- Additional scripts -->
                        <script>
                            /* ... Additional scripts ... */
                        </script>
                    </body>
                    </html>
                `)
            })
        } else {
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
                    <style>
                        /* ... Additional styles ... */
                    </style>
                </head>
                <body>
                    <!-- Navbar -->
                    <nav class="navbar is-white" role="navigation" aria-label="main navigation">
                        <div class="navbar-brand">
                            <a class="navbar-item" href="/">
                                <strong>Yōsei</strong>
                            </a>
                        </div>
                    </nav>
                    <!-- End of Navbar -->
                    <!-- Existing HTML -->
                    <section class="section">
                        <div class="container">
                            <div class="notification is-danger">
                                <p>Incorrect password. Please try again.</p>
                            </div>
                            <a href="/login" class="button is-primary">Try Again</a>
                        </div>
                    </section>
                    <!-- End of Existing HTML -->
                    <!-- Additional scripts -->
                    <script>
                        /* ... Additional scripts ... */
                    </script>
                </body>
                </html>
            `)
        }
    })
})

router.get('/dashboard', isAuthenticated, (req, res) => {
    const user = req.session.user

    // TODO: remove duplicate code
    const userPreviousPayments = billings
        .filter(
            (billing) =>
                billing?.user === user.email && parseFloat(billing?.amount) > 0
        )
        .sort(
            // sort date in ascending order...
            (a, b) => a.date > b.date
        )

    let isPayingCustomer = false
    if (userPreviousPayments.length > 0) {
        isPayingCustomer = true
    } else {
        // TODO: specify if the user has passed trial period or not.
    }

    // Calculate next payment due date (30 days from the last payment)
    const lastPaymentDate = isPayingCustomer
        ? new Date(billings[billings.length - 1].date)
        : null
    const nextPaymentDueDate = lastPaymentDate
        ? new Date(lastPaymentDate.getTime() + 30 * 24 * 60 * 60 * 1000)
        : null

    // if lastPaymentDate is less than 30 days (from today), we're good. Else, they're owing us.
    let isUserOwingUs = false
    if (lastPaymentDate && differenceInDays(new Date(), lastPaymentDate) > 30) {
        isUserOwingUs = true
    }

    user.paid = isPayingCustomer

    const articles = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, '..', 'data', 'articles.json'),
            'utf8'
        )
    )
    const userArticles = articles.filter(
        (article) => article.email === req.session.user.email
    )

    // Include analytics
    const totalArticles = userArticles.length
    let totalCentralViews = 0
    let totalArticleViews = 0

    userArticles.forEach((article) => {
        totalCentralViews += article.centralViews || 0
        totalArticleViews += article.articleViews || 0
    })

    // Read total page views from JSON file
    const pageViewsPath = path.join(__dirname, '..', 'data', 'page-views.json')
    const pageViewsData = JSON.parse(fs.readFileSync(pageViewsPath, 'utf8'))

    let articlesHtml = userArticles
        .map((article) => {
            let content = article.content
            let seeMore = false

            // Check if the article content is more than 500 words
            if (content.split(' ').length > 500) {
                content = content.split(' ').slice(0, 100).join(' ') + '...'
                seeMore = true
            }

            return `
        <div class="box mb-4">
            <h3 class="title is-4">${article.title}</h3>
            <p>${content}</p>
            <div class="buttons">
                ${
                    seeMore
                        ? '<a href="#" class="button is-link">See More</a>'
                        : ''
                }
                <a href="/edit-article/${
                    article.id
                }" class="button is-warning">Edit</a>
                <a href="/delete-article/${
                    article.id
                }" class="button is-danger">Delete</a>
            </div>
        </div>
        `
        })
        .join('')

    /**
     * TODO: Trial should be 7 days after the user registered???
     * So how do we know when a user registered??
     */
    // Include billing and trial information
    const trialDays = 7 // Replace with your trial duration
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + trialDays)

    // Include billing and trial information
    const billingSection = `
     <section class="section">
         <div class="container">
             <div class="billing-info">
                ${
                    isPayingCustomer && isUserOwingUs
                        ? `
                    <p>You are on a paid plan. But you're behind payment.</p>
                    `
                        : isPayingCustomer
                        ? `
                    <p>You are on a paid plan. Next payment due on: ${nextPaymentDueDate.toDateString()}</p>
                    `
                        : `
                    <p>Your free trial ends on: ${trialEndDate.toDateString()}</p>
                    <a href="/payment" class="button is-primary">Upgrade to Paid Plan</a>
                    `
                }
             </div>
         </div>
     </section>
 `

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
        <style>
            .is-primary {
                background-color: #6366F1;
            }
            .is-primary:hover {
                background-color: #4F46E5;
            }
            .navbar {
                border-bottom: 1px solid #e1e4e8;
            }
            /* Notion-inspired design system */
            .notification {
                padding: 1.5rem 2rem;
                border-radius: 0.375rem;
            }
            .box {
                padding: 1.5rem 2rem;
                border-radius: 0.375rem;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
            }
            /* Add this to your existing CSS */
            .hidden {
                display: none;
            }
        </style>
    </head>
    <body>
        <!-- Dashboard Header -->
        <nav class="navbar" role="navigation" aria-label="main navigation">
            <div class="navbar-brand">
                <a class="navbar-item" href="/dashboard">
                    <strong>Yōsei</strong>
                </a>
                <!-- Mobile Navbar Burger -->
                <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarMenu">
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
            </div>
            <div id="navbarMenu" class="navbar-menu">
                <div class="navbar-start">
                    <div class="navbar-item">
                        <div class="field">
                            <p class="control has-icons-left">
                                <input class="input" type="text" placeholder="Search...">
                                <span class="icon is-left">
                                    <i class="fas fa-search"></i>
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
                <div class="navbar-end">
                    <div class="navbar-item">
                        <span class="icon">
                            <i class="fas fa-bell"></i>
                        </span>
                    </div>
                    <div class="navbar-item has-dropdown is-hoverable">
                        <a class="navbar-link">
                            ${req.session.user.company}
                        </a>
                        <div class="navbar-dropdown">
                            <a class="navbar-item" href="/settings">Settings</a>
                            <a class="navbar-item" href="/help">Help</a>
                            <a class="navbar-item" href="/billing">Billing information</a>

                            <hr class="navbar-divider">
                            <a class="navbar-item" href="/logout">Logout</a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        <!-- End of Dashboard Header -->
        <!-- Main Content -->
        <section class="section">
            <div class="container">
                <h1 class="title is-2 mb-6">Welcome, ${
                    req.session.user.company
                }!</h1>

                <div class="box mt-6 notion-inspired">
                <h3 class="title is-4">Analytics</h3>
                <div class="columns">
                
                    <div class="column">
                        <div class="notification">
                            <p class="title is-6">Total Articles</p>
                            <p class="subtitle">${totalArticles}</p>
                        </div>
                    </div>
                    <div class="column">
                        <div class="notification">
                            <p class="title is-6">Total Article Views</p>
                            <p class="subtitle">${totalArticleViews}</p>
                        </div>
                    </div>
                    

                </div>
            </div>
                <div class="buttons mb-6">
                    <a href="/create-article" class="button is-primary">Create New Article</a>
                    <a href="/share-knowledgebase" class="button is-link">Share Yōsei</a>
                </div>
                ${
                    articlesHtml ||
                    '<p>You have no articles yet. Create one to get started!</p>'
                }
            </div>
        </section>
        <!-- End of Main Content -->
        <!-- Billing and Trial Information -->
        <section class="section">
            <div class="container">
            <script>
            document.addEventListener('DOMContentLoaded', () => {
                const billingInfo = document.querySelector('.billing-info');
                const billingHeader = document.createElement('h3');
                billingHeader.className = 'billing-header';
                billingHeader.textContent = 'Billing Information';
                billingHeader.style.cursor = 'pointer';
                billingInfo.parentElement.insertBefore(billingHeader, billingInfo);

                billingHeader.addEventListener('click', () => {
                    billingInfo.classList.toggle('hidden');
                });
            });
        </script>

        ${billingSection}

            </div>


        </section>
        <!-- End of Billing and Trial Information -->
        <!-- Additional scripts -->
        <script src="https://kit.fontawesome.com/a076d05399.js"></script>
        <!-- Script to handle mobile navbar toggle -->
        <script>
            document.addEventListener('DOMContentLoaded', () => {
                const navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
                if (navbarBurgers.length > 0) {
                    navbarBurgers.forEach(el => {
                        el.addEventListener('click', () => {
                            const target = el.dataset.target;
                            const $target = document.getElementById(target);
                            el.classList.toggle('is-active');
                            $target.classList.toggle('is-active');
                        });
                    });
                }
            });
        </script>
    </body>
    </html>
    `)
})

// edit and delete
router.get('/delete-article/:id', isAuthenticated, (req, res) => {
    // Check if the session exists
    if (!req.session || !req.session.user) {
        return res.redirect('/login')
    }

    const articleId = req.params.id
    const articles = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, '..', 'data', 'articles.json'),
            'utf8'
        )
    )
    const article = articles.find((article) => article.id === articleId)

    if (!article) {
        return res.redirect('/dashboard') // Redirect if the article is not found
    }

    res.send(`
    <html>
        <head>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
        </head>
        <body>
            <section class="section">
                <div class="container">
                    <h1 class="title">Are you sure you want to delete "${article.title}"?</h1>
                    <div class="buttons">
                        <a href="/confirm-delete/${articleId}" class="button is-danger">Yes, Delete</a>
                        <a href="/dashboard" class="button is-light">No, Go Back</a>
                    </div>
                </div>
            </section>
        </body>
    </html>
    `)
})

router.get('/confirm-delete/:id', isAuthenticated, (req, res) => {
    // Check if the session exists
    if (!req.session || !req.session.user) {
        return res.redirect('/login')
    }

    const articleId = req.params.id
    let articles = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, '..', 'data', 'articles.json'),
            'utf8'
        )
    )

    articles = articles.filter((article) => article.id !== articleId)

    fs.writeFileSync(
        path.join(__dirname, '..', 'data', 'articles.json'),
        JSON.stringify(articles, null, 4)
    )

    res.redirect('/dashboard')
})

//edit articles
router.get('/edit-article/:id', isAuthenticated, (req, res) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/login')
    }
    const articleId = req.params.id
    const articles = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, '..', 'data', 'articles.json'),
            'utf8'
        )
    )
    const article = articles.find((article) => article.id === articleId)

    if (!article) {
        return res.redirect('/dashboard') // Redirect if the article is not found
    }

    res.send(`
    <html>
        <head>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
            <style>
                .is-primary {
                    background-color: #6366F1;
                }
                .is-primary:hover {
                    background-color: #4F46E5;
                }
            </style>
        </head>
        <body>
            <section class="section">
                <div class="container">
                    <h1 class="title is-2 mb-6">Edit Article</h1>
                    <form action="/update-article/${articleId}" method="post">
                        <div class="field mb-4">
                            <label for="title" class="label">Title</label>
                            <div class="control">
                                <input type="text" name="title" id="title" class="input" value="${article.title}">
                            </div>
                        </div>
                        <div class="field mb-4">
                            <label for="content" class="label">Content</label>
                            <div class="control">
                                <textarea name="content" id="content" rows="6" class="textarea">${article.content}</textarea>
                            </div>
                        </div>
                        <div class="field is-grouped">
                            <div class="control">
                                <button type="submit" class="button is-primary">Update Article</button>
                            </div>
                            <div class="control">
                                <a href="/dashboard" class="button is-light">Back to Dashboard</a>
                            </div>
                        </div>
                    </form>
                </div>
            </section>
        </body>
    </html>
    `)
})

//update article

router.post('/update-article/:id', isAuthenticated, (req, res) => {
    if (!req.session.user) {
        req.session.originalUrl = req.originalUrl // Store the original URL to redirect after login
        return res.redirect('/login')
    }

    const articleId = req.params.id
    let articles = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, '..', 'data', 'articles.json'),
            'utf8'
        )
    )
    const articleIndex = articles.findIndex(
        (article) => article.id === articleId
    )

    if (articleIndex === -1) {
        return res.redirect('/dashboard') // Redirect if the article is not found
    }

    // Update the article's title and content
    articles[articleIndex].title = req.body.title
    articles[articleIndex].content = req.body.content

    // Save the updated articles data
    fs.writeFileSync(
        path.join(__dirname, '..', 'data', 'articles.json'),
        JSON.stringify(articles, null, 4)
    )

    // Explicitly save the session
    req.session.save((err) => {
        if (err) {
            console.error('Error saving session:', err)
            return res.redirect('/dashboard?error=true')
        }
        // Redirect back to the dashboard with a success message
        req.session.message = 'Article updated successfully!'
        res.redirect('/dashboard')
    })
})

//endpoint
router.post('/create-article', isAuthenticated, (req, res) => {
    // Check if the session exists
    if (!req.session || !req.session.user) {
        return res.redirect('/login')
    }

    const articles = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, '..', 'data', 'articles.json'),
            'utf8'
        )
    )

    // Create a new article with a unique ID
    const newArticle = {
        id: uuidv4(), // Generate a unique ID for the article
        title: req.body.title,
        content: req.body.content,
        email: req.session.user.email,
        section: req.body.section, // Add the section property
    }

    // Add the new article to the list of articles
    articles.push(newArticle)

    // Save the updated articles data
    fs.writeFileSync(
        path.join(__dirname, '..', 'data', 'articles.json'),
        JSON.stringify(articles, null, 4)
    )

    // Redirect back to the dashboard with a success message
    req.session.message = 'Article created successfully!'
    res.redirect('/dashboard')
})

// display
router.get('/create-article', isAuthenticated, (req, res) => {
    // Check if the session exists
    if (!req.session || !req.session.user) {
        return res.redirect('/login')
    }




    res.send(`
    <html>
    <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
        <style>
            body {
                background-color: #f4f5f7;
            }
            .notion-inspired {
                border: 1px solid #e1e4e8;
                border-radius: 8px;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                background-color: #ffffff;
                padding: 2rem;
            }
            .is-primary {
                background-color: #6366F1;
            }
            .is-primary:hover {
                background-color: #4F46E5;
            }
        </style>
    </head>
    <body>
        <section class="section">
            <div class="container">
                <h1 class="title is-2 mb-6">Create a New Article</h1>
                <div class="box notion-inspired">
                    <form action="/create-article" method="post">
                        <div class="field mb-4">
                            <label for="title" class="label">Title</label>
                            <div class="control">
                                <input type="text" name="title" id="title" class="input" placeholder="Article Title">
                            </div>
                        </div>
                        <div class="field mb-4">
                            <label for="content" class="label">Content</label>
                            <div class="control">
                                <textarea name="content" id="content" rows="6" class="textarea" placeholder="Article Content"></textarea>
                            </div>
                        </div>
                        <div class="field is-grouped">
                            <div class="control">
                                <button type="submit" class="button is-primary">Create Article</button>
                            </div>
                            <div class="control">
                                <a href="/dashboard" class="button is-light">Back to Dashboard</a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    </body>
    </html>
    `)
})




// Share knowledgebase page

router.get('/share-knowledgebase', isAuthenticated, (req, res) => {
    // Check if the session exists
    if (!req.session || !req.session.user) {
        return res.redirect('/login')
    }
    // Generate a unique link for the user's knowledgebase using localhost and company name
    const uniqueLink = `http://localhost:3000/knowledgebase/${encodeURIComponent(
        req.session.user.company
    )}`

    res.send(`
    <html>
        <head>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
            <style>
                .is-primary {
                    background-color: #6366F1;
                }
                .is-primary:hover {
                    background-color: #4F46E5;
                }
                .navbar {
                    border-bottom: 1px solid #e1e4e8;
                }
            </style>
        </head>
        <body>
            <!-- Navbar -->
            <nav class="navbar" role="navigation" aria-label="main navigation">
                <div class="navbar-brand">
                    <a class="navbar-item" href="/dashboard">
                        <strong>Yōsei</strong>
                    </a>
                </div>
                <div class="navbar-menu">
                    <div class="navbar-end">
                        <div class="navbar-item has-dropdown is-hoverable">
                            <a class="navbar-link">
                                ${req.session.user.company}
                            </a>
                            <div class="navbar-dropdown">
                                <a class="navbar-item" href="/settings">Settings</a>
                                <a class="navbar-item" href="/help">Help</a>
                                <a class="navbar-item" href="/billing">Billing information</a>

                                <hr class="navbar-divider">
                                <a class="navbar-item" href="/logout">Logout</a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Main Content -->
            <section class="section">
                <div class="container">
                    <h1 class="title is-2 mb-6">Share Your Yōsei</h1>
                    <p class="subtitle mb-4">You can share your Yōsei page with others using the link below:</p>
                    <div class="field has-addons mb-4">
                        <div class="control is-expanded">
                            <input type="text" value="${uniqueLink}" class="input" readonly>
                        </div>
                        <div class="control">
                            <button onclick="copyLink()" class="button is-primary">Copy Link</button>
                        </div>
                    </div>
                    <p>Customize the look and feel of your Yōsei page to match your company's brand.</p>
                    <a href="/settings" class="button is-link mt-4">Choose a Theme</a>
                    <script>
                        function copyLink() {
                            const input = document.querySelector('input');
                            input.select();
                            document.execCommand('copy');
                        }
                    </script>
                </div>
            </section>
        </body>
        <script src="https://kit.fontawesome.com/a076d05399.js"></script>
    </html>
    `)
})

router.post('/share-knowledgebase', (req, res) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/login')
    }

    // Here, you can add logic to handle the sharing action, such as sending an email or saving to a database.

    // For now, we'll just redirect back to the dashboard with a message.
    req.session.message =
        'Knowledgebase link copied successfully! Share it with your team.'
    res.redirect('/dashboard')
})

// Knowledgebase page
router.get('/knowledgebase/:companyName', (req, res) => {
    const companyName = req.params.companyName

    // Read total page views from JSON file
    const pageViewsPath = path.join(__dirname, '..', 'data', 'page-views.json')
    let pageViewsData = {}
    

    try {
        pageViewsData = JSON.parse(fs.readFileSync(pageViewsPath, 'utf8'))
    } catch (error) {
        // If the file doesn't exist or is invalid, create a new data structure
        pageViewsData.totalPageViews = 0
    }

    // Increment page views counter
    pageViewsData.totalPageViews++

    // Write updated total page views back to JSON file
    fs.writeFileSync(
        pageViewsPath,
        JSON.stringify(pageViewsData, null, 2),
        'utf8'
    )

    const searchQuery = req.query.search || ''

    const articles = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, '..', 'data', 'articles.json'),
            'utf8'
        )
    )
    const users = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, '..', 'data', 'users.json'),
            'utf8'
        )
    )

    const user = users.find((user) => user.company === companyName)

    let userArticles = articles.filter(
        (article) => article.email === user.email
    )
    const totalArticles = userArticles.length
    let totalArticleViews = 0

    userArticles.forEach((article) => {
        totalArticleViews += article.articleViews || 0
    })

    if (searchQuery) {
        userArticles = userArticles.filter(
            (article) =>
                article.title.includes(searchQuery) ||
                article.content.includes(searchQuery)
        )
    }

    let articlesHtml =
        userArticles
            .map((article) => {
                let snippet =
                    article.content.split(' ').slice(0, 6).join(' ') + '...'
                return `
            <div class="card">
                <header class="card-header">
                    <p class="card-header-title">${article.title}</p>
                </header>
                <div class="card-content">
                    <div class="content">${snippet}</div>
                </div>
                <footer class="card-footer">
                    <a href="/article/${article.id}" class="card-footer-item">Read More</a>
                </footer>
            </div>
        `
            })
            .join('') ||
        '<p class="subtitle has-text-grey">No articles available.</p>'

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
    <style>
        body {
            font-family: 'Avenir Next', sans-serif;
            background-color: #F4F4F5;
        }
        .hero {
            background-color: ${user.headerColor || '#3273dc'};
            border-bottom: 1px solid #E4E4E7;
            color: #ffffff;
        }
        .card {
            margin-top: 20px;
            border: none;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: box-shadow 0.3s;
        }
        .card:hover {
            box-shadow: 0 6px 8px rgba(0, 0, 0, 0.1);
        }
        .card-header-title {
            font-size: 1.25rem;
            font-weight: 500;
        }
        .card-content {
            background-color: #ffffff;
        }
        .card-footer-item {
            color: #23d160;
        }
        .input.is-large {
            border-color: #23d160;
        }
        .icon.is-left {
            color: #23d160;
        }
        .hero-title {
            color: #ffffff;
        }
    </style>
    </head>
    <body>
    <section class="hero is-medium">
    <div class="hero-body">
        <div class="container">
            <h1 class="title is-2 mb-6 hero-title">Knowledgebase for ${companyName}</h1>
            <div class="field">
                <div class="control has-icons-left">
                    <input type="text" name="search" placeholder="Search articles..." class="input is-large" value="${searchQuery}" onkeyup="debounceSearch('${companyName}', event.target.value)">
                    <span class="icon is-left">
                        <i class="fas fa-search"></i>
                    </span>
                </div>
            </div>
        </div>
    </div>
</section>
       

        <!-- Knowledgebase articles section -->
        <section class="section">
            <div class="container">
                ${articlesHtml}
            </div>
        </section>

        <!-- Additional scripts -->
        <script src="https://kit.fontawesome.com/a076d05399.js"></script>
        <script>
        let debounceTimeout;
        function debounceSearch(companyName, query) {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                window.location.href = "/knowledgebase/" + encodeURIComponent(companyName) + "?search=" + encodeURIComponent(query);
            }, 500);
        }
    </script>
        <!-- Other scripts -->
    </body>
    </html>
    `)
})

// individual articles
router.get('/article/:articleId', (req, res) => {
    const articleId = req.params.articleId

    const articlesPath = path.join(__dirname, '..', 'data', 'articles.json')
    const usersPath = path.join(__dirname, '..', 'data', 'users.json')

    const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'))
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'))

    const article = articles.find((a) => a.id === articleId)

    if (!article) {
        return res.status(404).send('Article not found')
    }

    const user = users.find((u) => u.email === article.email)
    const companyName = user ? user.company : 'Default Company'
    // Update the article views and central views
    article.articleViews = (article.articleViews || 0) + 1
    article.centralViews = (article.centralViews || 0) + 1

    // Save the updated articles back to the file
    const updatedArticles = articles.map((a) =>
        a.id === articleId ? article : a
    )
    fs.writeFileSync(
        articlesPath,
        JSON.stringify(updatedArticles, null, 2),
        'utf8'
    )

    const pageContent = `
    <html>
        <head>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
            <style>
                body {
                    font-family: 'Avenir Next', sans-serif;
                    background-color: #F4F4F5;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px 20px;
                }
                .title {
                    border-bottom: 1px solid #E4E4E7;
                    padding-bottom: 20px;
                }
                p {
                    line-height: 1.6;
                    margin-bottom: 20px;
                    font-size: 1.1rem;
                    color: #333;
                }
                .button {
                    background-color: #E4E4E7;
                    color: #333;
                    transition: background-color 0.3s;
                }
                .button:hover {
                    background-color: #D1D5DB;
                }
            </style>
        </head>
        <body>
            <section class="section">
                <div class="container">
                    <h1 class="title is-2 mb-6">${article.title}</h1>
                    <h2 class="subtitle is-5 mb-3">Article owned by: ${companyName}</h2>
                    <p>${article.content}</p>
                    <a href="/knowledgebase/${encodeURIComponent(
                        companyName
                    )}" class="button mt-4">Back to Knowledgebase</a>
                </div>
            </section>
            <script src="https://kit.fontawesome.com/a076d05399.js"></script>
        </body>
    </html>
    `

    res.send(pageContent)
})

//settings function
router.get('/settings', isAuthenticated, (req, res) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/login')
    }

    const userHeaderColor = req.session.user.headerColor || '#3273dc'

    let successMessage = ''
    if (req.query.success) {
        successMessage =
            '<div class="notification is-success">Settings updated successfully!</div>'
    }

    const colorSelectOptions = colorOptions
        .map(
            (option) =>
                `<option value="${option.value}"${
                    option.value === userHeaderColor ? ' selected' : ''
                }>${option.name}</option>`
        )
        .join('')

    const pageContent = `
        <html>
            <head>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
                <style>
                    body {
                        font-family: 'Avenir Next', sans-serif;
                        background-color: #F4F4F5;
                    }
                    .hero {
                        background-color: ${userHeaderColor};
                        border-bottom: 1px solid #E4E4E7;
                        color: #ffffff;
                    }
                    /* Add any additional styles here */
                </style>
            </head>
            <body>
                <nav class="navbar" role="navigation" aria-label="main navigation">
                    <div class="navbar-brand">
                        <a class="navbar-item" href="/dashboard">
                            <strong>Yōsei</strong>
                        </a>
                    </div>
                    <div class="navbar-menu">
                        <div class="navbar-end">
                            <div class="navbar-item has-dropdown is-hoverable">
                                <a class="navbar-link">
                                    ${req.session.user.company}
                                </a>
                                <div class="navbar-dropdown">
                                    <a class="navbar-item" href="/settings">Settings</a>
                                    <a class="navbar-item" href="/help">Help</a>
                                    <a class="navbar-item" href="/billing">Billing information</a>

                                    <hr class="navbar-divider">
                                    <a class="navbar-item" href="/logout">Logout</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                <section class="section">
                    <div class="container">
                        ${successMessage}
                        <h1 class="title is-2 mb-6">Settings</h1>
                        <form action="/update-settings" method="post">
                            <div class="field">
                                <label class="label">Email</label>
                                <div class="control">
                                    <input class="input" type="email" name="email" value="${
                                        req.session.user.email
                                    }">
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Employee Role</label>
                                <div class="control">
                                    <input class="input" type="text" name="role" placeholder="e.g., Software Developer" value="${
                                        req.session.user.role || ''
                                    }">
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Country</label>
                                <div class="control">
                                    <input class="input" type="text" name="country" placeholder="e.g., United States" value="${
                                        req.session.user.country || ''
                                    }">
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Theme Color</label>
                                <div class="control">
                                    <div class="select">
                                        <select name="headerColor">
                                            ${colorSelectOptions}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="field">
                                <div class="control">
                                    <button type="submit" class="button is-primary">Save Changes</button>
                                </div>
                            </div>
                        </form>
                        <div class="mt-4">
                            <a href="/dashboard" class="button is-light">Go back to Dashboard</a>
                        </div>
                    </div>
                </section>
            </body>
            <script src="https://kit.fontawesome.com/a076d05399.js"></script>
        </html>
    `

    res.send(pageContent)
})

router.post('/update-settings', isAuthenticated, (req, res) => {
    // Check if the session exists
    if (!req.session || !req.session.user) {
        return res.redirect('/login')
    }

    try {
        // Get the new settings from the form submission
        const { email, role, country, headerColor } = req.body

        // Load the users data
        const users = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, '..', 'data', 'users.json'),
                'utf8'
            )
        )

        // Find the current user and update their settings
        const userIndex = users.findIndex(
            (user) => user.email === req.session.user.email
        )
        if (userIndex !== -1) {
            if (email) users[userIndex].email = email
            if (role) users[userIndex].role = role
            if (country) users[userIndex].country = country
            if (headerColor) users[userIndex].headerColor = headerColor

            // Save the updated users data
            fs.writeFileSync(
                path.join(__dirname, '..', 'data', 'users.json'),
                JSON.stringify(users, null, 4)
            )

            // Update the session data
            req.session.user = users[userIndex]

            // Redirect back to the settings page with a success message
            res.redirect('/settings?success=true')
        } else {
            throw new Error('User not found') // Handle this error as you see fit
        }
    } catch (error) {
        console.error('Error updating settings:', error)
        // Handle the error as needed and redirect with an error message
        res.redirect('/settings?error=true')
    }
})

router.get('/help', isAuthenticated, (req, res) => {
    // Check if the session exists
    if (!req.session || !req.session.user) {
        return res.redirect('/login')
    }

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
        <style>
            body {
                background-color: #f4f5f7;
            }
            .notion-inspired {
                border: 1px solid #e1e4e8;
                border-radius: 8px;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                background-color: #ffffff;
                padding: 2rem;
            }
            .is-primary {
                background-color: #6366F1;
            }
            .is-primary:hover {
                background-color: #4F46E5;
            }
        </style>
    </head>
    <body>
        <!-- Help Page Content -->
        <section class="section">
            <div class="container">
                <h1 class="title is-2 mb-6">Help & Support</h1>
                <div class="box notion-inspired">
                    <h2 class="title is-4">Frequently Asked Questions</h2>
                    <p><strong>Q: How do I create a new article?</strong></p>
                    <p>A: Navigate to the dashboard and click on the "Create New Article" button. Fill in the title and content, then click "Create Article".</p>
                    <br>
                    <p><strong>Q: How can I share my knowledgebase?</strong></p>
                    <p>A: On the dashboard, click the "Share Knowledgebase" button. You'll be provided with a unique link that you can share with others.</p>
                    <br>
                    <p><strong>Q: How do I edit my account settings?</strong></p>
                    <p>A: Navigate to the settings page from the dropdown menu on the top right. Here, you can update your email, role, and country.</p>
                    <br>
                    <p><strong>Q: Can I change the theme of my knowledgebase?</strong></p>
                    <p>A: Yes, you can customize the theme of your knowledgebase. Go to the settings page and choose from the available themes to personalize your knowledgebase's appearance.</p>
                    <br>
                    <p><strong>Q: How do I manage my billing information?</strong></p>
                    <p>A: You can view and manage your billing information by clicking the "Upgrade to Paid Plan" button on the dashboard. You'll be able to choose a plan and provide your payment details securely.</p>
                </div>
                <a href="/dashboard" class="button is-light mt-4">Back to Dashboard</a>
            </div>
        </section>
        <!-- End of Help Page Content -->
    </body>
    </html>
    `)
})

// Payment page
router.get('/payment', (req, res) => {
    res.send(`
        <!-- ... existing HTML ... -->

        <!-- Payment Form (Stripe Integration) -->
        <section class="section">
            <div class="container">
                <h2 class="title is-2">Payment Details</h2>
                <form action="/payment-confirm" method="post">
                    <!-- Add Stripe elements here -->
                    <!-- Card number, expiration date, CVC, etc. -->
                    <!-- Replace with your actual Stripe integration code -->
                    <button class="button is-primary" type="submit">Proceed to Payment</button>
                </form>
            </div>
        </section>

        <!-- ... existing HTML ... -->
    `)
})

// Payment confirmation page
router.post('/payment-confirm', (req, res) => {
    // ... Handle payment confirmation and subscription update ...

    const user = req.session.user

    // Update user's subscription status in your user data structure
    user.paid = true // Assuming you have a property called 'paid' to track subscription status

    // Store billing information

    const newBilling = {
        user: user.email,
        date: new Date(),
        amount: 10,
    }

    billings.push(newBilling)
    fs.writeFileSync(billingsPath, JSON.stringify(billings, null, 2), 'utf8')

    // Add the subscription date to user's paidDates array
    if (!user.paidDates) {
        user.paidDates = []
    }
    user.paidDates.push(newBilling.date.toISOString())

    req.session.user = user
    req.session.save((err) => {
        if (err) {
            console.error('Error saving session:', err)
            return res.status(500).send('Internal Server Error')
        }

        res.send(`
            <!-- ... existing HTML ... -->

            <!-- Payment Confirmation -->
            <section class="section">
            <div class="container">
            <h2 class="title is-2">Payment Successful</h2>
            <p>Your payment was successful! You are now on a paid plan.</p>
            <a href="/dashboard" class="button is-primary">Go to Dashboard</a>
        </div>
            </section>

            <!-- ... existing HTML ... -->
        `)
    })
})

// Billing history page
router.get('/billing', isAuthenticated, (req, res) => {
    // Check if the session exists
    if (!req.session || !req.session.user) {
        return res.redirect('/login')
    }

    const user = req.session.user

    // Load billing history

    const userBillings = billings.filter(
        (billing) => billing.user === user.email
    )

    let billingHtml = ''

    // TODO: need a better way to handle this (checking when and if a user is on a paid plan).
    if (user.paid) {
        billingHtml = `
            <section class="section">
                <div class="container">
                    <h2 class="title is-2">Billing Information</h2>
                    <p>You are on a paid plan. Your subscription started on: ${user.paidDate}</p>
                </div>
            </section>
        `
    } else if (user.trialEnd && new Date(user.trialEnd) > new Date()) {
        billingHtml = `
            <section class="section">
                <div class="container">
                    <h2 class="title is-2">Billing Information</h2>
                    <p>Your trial period ends on: ${new Date(
                        user.trialEnd
                    ).toLocaleDateString()}</p>
                </div>
            </section>
        `
    } else {
        billingHtml = `
            <section class="section">
                <div class="container">
                    <h2 class="title is-2">Billing Information</h2>
                    <p>You do not have an active subscription. Please proceed to payment to subscribe.</p>
                    <a href="/payment" class="button is-primary">Proceed to Payment</a>
                </div>
            </section>
        `
    }

    res.send(`
    <html>
    <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
        <style>
            body {
                background-color: #f4f5f7;
            }
            .notion-inspired {
                border: 1px solid #e1e4e8;
                border-radius: 8px;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                background-color: #ffffff;
                padding: 2rem;
            }
            .is-primary {
                background-color: #6366F1;
            }
            .is-primary:hover {
                background-color: #4F46E5;
            }
        </style>
    </head>
        <!-- ... existing HTML ... -->

        <!-- Billing Information -->
        ${billingHtml}

        <!-- Back to Dashboard Button -->
        <section class="section">
            <div class="container">
                <a href="/dashboard" class="button is-light">Back to Dashboard</a>
            </div>
        </section>

        <!-- Additional scripts -->
        <script>
            /* ... Additional scripts ... */
        </script>
        </html>
    `)
})

router.get('/logout', (req, res) => {
    // Destroy the session and log the user out
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err)
            return res.redirect('/dashboard') // or wherever you want to redirect in case of an error
        }

        // Redirect to the login page or homepage after logout
        res.redirect('/login')
    })
})

module.exports = router
