const express = require("express");
const articleRouter = require('./routes/articles');
const bcrypt = require('bcrypt');

const app = express();
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

//app.set("port", (process.env.PORT || 5000));


app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false}));

app.listen(process.env.PORT);

app.get("/", async (req, res) => {
sess = req.session;

if(sess.username) {
    try {
        let username = sess.username;
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM blog_entries ');
        const results = { 'results': (result) ? result.rows : null};
        res.render('articles/index', {articles: result.rows, username: username});
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
}
   
  
});

app.use('/articles', articleRouter);