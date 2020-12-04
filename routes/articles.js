const express = require("express");
//const bodyParser = require('body-parser');
const router = express.Router();
const bcrypt = require('bcryptjs');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

router.use(express.urlencoded({extended: true}));


// const { Pool } = require('pg');
// let connectionString = process.env.DATABASE_URL;
// const pool = new Pool({
//     connectionString: connectionString, ssl: true
// });

const { Pool } = require('pg');
let connectionString = "postgres://bolster21:bolster1521@localhost:5432/bolsterdb";
const pool = new Pool({
    connectionString: connectionString
});

router.get('/login', (req, res) => {
    res.render('articles/login.ejs');
})

router.post('/login', async (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    
    var params =  [username];
    try {
        const client = await pool.connect();
        const result = await client.query("SELECT user_password, id FROM user_account WHERE username = $1", params);
        
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
        //hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
       
        var username = req.body.username;
        var email = req.body.email;
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
    res.render('articles/new')
});

router.get('/edit:id', async (req, res) => {
    let id = req.params.id;

    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM blog_entries WHERE id = $1', params);
        //console.log(result.rows);
        res.render('articles/edit', {articles: result.rows[0]});
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
    let id = req.params.id;
    params = [id];
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM blog_entries WHERE id = $1', params);
        //console.log(result.rows);
        res.render('articles/show', {article: result.rows[0]});
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
            res.render('articles/new', {article: article})
        }
        
        //res.redirect('/');
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