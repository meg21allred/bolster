const express = require("express");
const articleRouter = require('./routes/articles');
const { Pool } = require("pg");
const app = express();
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

//const connectionString = process.env.DATABASE_URL|| "postgres://bolsterUser:bolster1521@localhost:5432/bolsterdb";
//const pool = new Pool({connectionString: connectionString, ssl: true});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

//app.set("port", (process.env.PORT || 5000));


app.set('view engine', 'ejs');

app.use('/articles', articleRouter);

// app.listen(app.get('port'), function() {
//     console.log("now listening for connection on port: ", app.get("port"));
// })

app.listen(process.env.PORT);

app.get("/", async (req, res) => {

    //var articles;

    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM blog_entries');
        const results = { 'results': (result) ? result.rows : null};
        //res.send(JSON.stringify(results));
        res.json(results);
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
    
    // const articles = [{
    //     title: 'Test Article',
    //     createdAt: new Date(),
    //     description: 'Test description'
    // }];

   //res.render('articles/index', { articles: results});
});