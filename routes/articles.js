const express = require("express");
//const bodyParser = require('body-parser');
const router = express.Router();
const bcrypt = require('bcryptjs');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

router.use(express.urlencoded({extended: true}));
router.use(express.static(__dirname + '/public'));

//for heroku connection
const { Pool } = require('pg');
let connectionString = process.env.DATABASE_URL;
const pool = new Pool({
    connectionString: connectionString, ssl: true
});

//for local host connection
// const { Pool } = require('pg');
// let connectionString = "postgres://bolster21:bolster1521@localhost:5432/bolsterdb";
// const pool = new Pool({
//     connectionString: connectionString
// });

router.get('/login', (req, res) => {
    let user = req.session.username;
    let error;
    res.render('articles/login.ejs', {user: user, error: error});
})

router.post('/login', async (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var error;
    var params =  [username];
    try {
        const client = await pool.connect();
        const result = await client.query("SELECT * FROM user_account WHERE username = $1", params);
        if (result.rows.length >= 1 ) {
            //get hashed password and compare to entered password
            var hash = result.rows[0].user_password;
            bcrypt.compare(password, hash, function (err, hashResult) {
                if (hashResult) {
                    console.log('access granted');
                    //store session variable username
                    req.session.username = username;
                    req.session.bloggerId = result.rows[0].id;
                    res.redirect('/');
                } else {
                    console.log('access denied');  
                }
            })
            client.release();
        } else {
            error = "Username or password is incorrect";
            res.render("articles/login.ejs", {error: error});
        }
       
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
    
});

router.get('/register', (req, res) => {
    let user = req.session.username;
    let error1;
    res.render('articles/register.ejs', {user: user, error1: error1});
})

router.post('/register', async (req, res) => {
    var username = req.body.username;
    var email = req.body.email;
    var error1;
    console.log('username: ', username)
    let userParams = [username];
    try {
        const client = await pool.connect();
        const result1 = await client.query("SELECT * FROM user_account WHERE username = $1", userParams);
        client.release();
        if(result1.rows.length >= 1) {
            if (result1.rows[0].username == username) {
                error1 = "Username already in use";
                res.render('articles/register.ejs', {error1: error1})
                
            }
        }
        let emailParams = [email];
        const result2 = await client.query("SELECT * FROM user_account WHERE user_email = $1", emailParams);
        if (result2.rows.length >= 1) {
            if (result2.rows[0].user_email == email) {
                error1 = "email already in use";
                res.render('articles/register.ejs', {error1: error1})
            }
        }
        
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
console.log("didnt find username");
    try {
        //hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
       
        var password = hashedPassword;
        //var password = req.body.password;

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
    let user = req.session.username;
    console.log("user: " + user);
    res.render('articles/new', {user: user})
});

router.get('/edit:id', async (req, res) => {
    let id = req.params.id;
    let user = req.session.username;
    let params = [id];
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM blog_entries WHERE id = $1', params);
        //console.log(result.rows);
        res.render('articles/edit', {articles: result.rows[0], user: user});
        client.release();
        
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

router.post('/edit:id', async (req, res) => {

    let id = req.params.id;
    let title = req.body.title;
    let description = req.body.description;
    let markdown = req.body.markdown;

    let params = [title, description, markdown, id]
    try {
        const client = await pool.connect();
        const result = await client.query('UPDATE blog_entries SET title = $1, blog_description = $2, markdown = $3 WHERE id = $4', params);
        res.redirect('/');
        client.release();
        
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
})

router.get('/id:id', async (req, res) => {
    let user = req.session.username;
    let id = req.params.id;
    params = [id];
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM blog_entries WHERE id = $1', params);
        //console.log(result.rows);
        res.render('articles/show', {article: result.rows[0], user: user});
        client.release();
        
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

router.post('/', async (req, res) => {

    var blogTitle = req.body.title;
    var blogDescription = req.body.description;
    var blogMarkdown = req.body.markdown;
    var articleId; 
    var bloggerId = req.session.bloggerId;
    let user = req.session.username;

    var params = [blogTitle, blogDescription, blogMarkdown, bloggerId];
    try {
        const client = await pool.connect();
        const result = await client.query("INSERT INTO blog_entries (title, blog_description, markdown, blogger_id) VALUES ($1, $2, $3, $4)", params);
        client.release();
        try {
            
            //this redirects to the articles id page
            var idParams = [blogDescription];
            try {
                const client = await pool.connect();
                const idResult = await client.query("SELECT id FROM blog_entries WHERE blog_description = $1", idParams);
                articleId = idResult.rows[0].id;
                console.log("articleId: " + articleId);
                client.release();
            } catch (err) {
                console.error(err);
                res.send("Error " + err);
            }
            
            res.redirect(`/articles/id${articleId}`);
        } catch (e) {
            let article = {
                title: blogTitle,
                description: blogDescription,
                markdown: blogMarkdown,
          }
            res.render('articles/new', {article: article, user: user})
        }
        
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});


router.post('/delete:id', async (req, res) => {
    let id = req.params.id
    var params = [id];
            try {
                const client = await pool.connect();
                const result = await client.query("DELETE FROM blog_entries WHERE id = $1", params);
        
                client.release();
            } catch (err) {
                console.error(err);
                res.send("Error " + err);
            }
            res.redirect("/");
})

//log out of session 
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