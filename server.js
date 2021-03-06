const express = require("express");
const articleRouter = require('./routes/articles');
const session = require('express-session');
const app = express();
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

//heroku connection
const { Pool } = require('pg');
let connectionString = process.env.DATABASE_URL; /*|| "postgres://bolster21:bolster1521@localhost:5432/bolsterdb"*/
const pool = new Pool({
    connectionString: connectionString, ssl: true
});

//locat host connection
// const { Pool } = require('pg');
// let connectionString = "postgres://bolster21:bolster1521@localhost:5432/bolsterdb"
// const pool = new Pool({
//     connectionString: connectionString
// });

//for local host
// app.set("port", (5000));


app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

//sessions for local host
app.use(session({secret: 'bolsterblog', saveUninitialized: false, resave: false}));


app.get("/", async (req, res) => {
    
    //sessions for local host
   var user = req.session.username;
   var id = req.session.bloggerId;
   var params = [id]
   var user;
   console.log(id);
   if (user != null) {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM blog_entries WHERE blogger_id = $1 ORDER BY blog_date DESC', params);
        
        var minimum = 0;
        var maximum = result.rows.length - 1;
        var randomnumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
        res.render('articles/index', {articles: result.rows, user: user, random: randomnumber});
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    } 
} else {
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT * FROM blog_entries ');
            
            var minimum = 0;
            var maximum = result.rows.length - 1;
            var randomnumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
            res.render('articles/index', {articles: result.rows, user: user, random: randomnumber});
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    }
   
       
    
});

app.get('/random', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM blog_entries');
        
        var minimum = 0;
        var maximum = result.rows.length - 1;
        var randomnumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
        var randomBlogPost = `
        <div class="container" id="randomDiv">
          <h1 >Random blog post</h1>
                <div class="card mt-4">
                    <div class="card-body">
                        <h4 class="card-title">${result.rows[randomnumber].title}</h4>
                        <div class="card-subtitle text-muted mb-2">
                        ${result.rows[randomnumber].blog_date.toLocaleDateString()}
                        </div>
                        <div class="card-text mb-2">${result.rows[randomnumber].blog_description}</div>
                    </div>
                </div>
                <br>
                <button class="btn btn-success" id="randomButton" onclick="getRandomBlog()">Get New Entry</button>

        `
        res.send(randomBlogPost);
        client.release();
        
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

app.use('/articles', articleRouter);

//for localhost
// app.listen(app.get('port'), () => {
//     console.log('App Started on PORT: ', app.get('port'));
// });

//for heroku
app.listen(process.env.PORT);