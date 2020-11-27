const express = require("express");
const bodyParser = require('body-parser');
const router = express.Router();
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
// const passport = require('passport');
// const flash = require('express-flash');
 const session = require('express-session');

 var sess;

router.use(express.urlencoded({extended: true}));
// router.use(flash())
router.use(session({
    sercret: "shhh..",
    saveUninitialized: true,
    resave: true
}));

// router.use(passport.initialize());
// router.use(passport.session());

// const initializePassport = require('./passport-config');
// initializePassport(
//     passport, 
//     username => users.find(user => user.username === username)
// );


const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});


//local variable for now.. to be in the database
const users = [];

router.get('/login', (req, res) => {
    sess=req.session;
    if(sess.username) {
        return res.redirect('/');
    }
    
    res.render('articles/login.ejs');
})

router.post('/login', (req, res) => {
    sess = req.session;
    sess.username = req.body.username;
    sess.password = req.body.password;
    res.end('done');
    res.redirect('/');
});

router.get('/register', (req, res) => {
    res.render('articles/register.ejs');
})

router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        //don't need this with the database
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/articles/login')
    } catch {
        res.redirect('/articles/register')
    }
})


router.get('/new', (req, res) => {
    res.render('articles/new')
});

router.get('/:id', (req, res) => {
    res.send('this is the id page');
});

router.post('/', async (req, res) => {

    var blogTitle = req.body.title;
    var blogDescription = req.body.description;
    var blogMarkdown = req.body.markdown;
    var articleId = req.body.id;

    params = [blogTitle, blogDescription, blogMarkdown];
    try {
        const client = await pool.connect();
        const result = await client.query("INSERT INTO blog_entries (title, blog_description, markdown) VALUES ($1, $2, $3)", params);
        client.release();
        res.redirect(`/articles/${articleId}`);
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }


})

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    })
})

module.exports = router;