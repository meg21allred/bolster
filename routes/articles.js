const express = require("express");
const bodyParser = require('body-parser');
const router = express.Router();
const bcrypt = require('bcrypt');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

router.use(express.urlencoded({extended: true}));


const { Pool } = require('pg');
let connectionString = process.env.DATABASE_URL || "postgres://bolster21:bolster1521@localhost:5432/bolsterdb";
const pool = new Pool({
    connectionString: connectionString, ssl: true
});


//local variable for now.. to be in the database
const users = [];

router.get('/login', (req, res) => {
    res.render('articles/login.ejs');
})

router.post('/login', async (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var user; //here is where we would get the username to store the session variable
    
    var params =  [username];
    try {
        const client = await pool.connect();
        const result = await client.query("SELECT user_password FROM user_account WHERE username = $1", params);
        var hash = result.rows[0].user_password;
        bcrypt.compare(password, hash, function (err, hashResult) {
            if (hashResult) {
                console.log('access granted');
                //store session variable into user here
                req.session.username = username;
                res.redirect('/');
            } else {
                console.log('access denied');  
            }
        })
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
    
});

router.get('/register', (req, res) => {
    res.render('articles/register.ejs');
})

router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
     
        var username = req.body.username;
        var email = req.body.email;
        var password = hashedPassword;

        var params = [username, email, password];
        try {
            const client = await pool.connect();
            const result = await client.query("INSERT INTO user_account (username, user_email, user_password) VALUES ($1, $2, $3)", params);
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
        res.redirect('/articles/login')
    } catch {
        res.redirect('/articles/register')
    }
})


router.get('/new', (req, res) => {
    res.render('articles/new')
});

router.get('/id:id', (req, res) => {
    res.send('this is the id page');
});

router.post('/', async (req, res) => {

    var blogTitle = req.body.title;
    var blogDescription = req.body.description;
    var blogMarkdown = req.body.markdown;
    var articleId = req.body.id;

    var params = [blogTitle, blogDescription, blogMarkdown];
    try {
        const client = await pool.connect();
        const result = await client.query("INSERT INTO blog_entries (title, blog_description, markdown) VALUES ($1, $2, $3)", params);
        client.release();
        //this redirect to the articles id page
        //res.redirect(`/articles/id${articleId}`);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

router.get('/logout', function(req,res){
	
	req.session.destroy(function(err) {
		if(err) {
			console.log(err);
		} else {
			res.redirect('/');
		}
	});

});

module.exports = router;