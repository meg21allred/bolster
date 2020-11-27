const express = require("express");
const router = express.Router();
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

router.get('/login', (req, res) => {
    res.render('login.ejs');
})

router.get('/register', (req, res) => {
    res.render('register.ejs');
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

module.exports = router;