const express = require("express");
const articleRouter = require('./routes/articles');
const parser = require("body-parser");
//const { Pool } = require("pg");
const pg = require('pg');
const app = express();
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

var connect = process.env.DATABASE_URL;
//const connectionString = process.env.DATABASE_URL|| "postgres://bolsterUser:bolster1521@localhost:5432/bolsterdb";
//const pool = new Pool({connectionString: connectionString, ssl: true});

// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
//     ssl: true
// });

//app.set("port", (process.env.PORT || 5000));


app.set('view engine', 'ejs');

app.use('/articles', articleRouter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
// app.listen(app.get('port'), function() {
//     console.log("now listening for connection on port: ", app.get("port"));
// })

app.listen(process.env.PORT);

app.get("/", async (req, res) => {

    pg.connect(pool, (err, client, done) => {
        if (err) {
            return console.error('error fetching client from pool', err);
        }

        client.query('SELECT * FROM blog_entries', (err, result) => {
            if(err) {
                return console.error('erron running query', err);
            }
            res.render('articles/index', {articles: result.rows});
            done();
        });  
    });
    // var articles;
    // try {
    //     const client = await pool.connect();
    //     //const result = await client.query('SELECT * FROM blog_entries');
    //     //const results = { 'results': (result) ? result.rows : null};
    //     //res.send(results);
    //     //res.json(results);
    //     //res.send(results[0].title);
        
    //     client.release();
        
    // } catch (err) {
    //     console.error(err);
    //     res.send("Error " + err);
    // }
   
    // const articles = [{
    //     title: 'Test Article',
    //     createdAt: new Date(),
    //     description: 'Test description'
    // }];

   //res.render('articles/index', { articles: results});
});