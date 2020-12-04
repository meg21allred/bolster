CREATE DATABASE bolsterdb OWNER bolster21;

CREATE TABLE blog_entries (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    blog_date DATE DEFAULT CURRENT_DATE,
    blog_description VARCHAR(255),
    markdown VARCHAR(255),
    blogger_id INT REFERENCES user_account(id)
);

CREATE TABLE user_account (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL
);

INSERT INTO user_account (username, user_email, user_password) 
VALUES ('catwoman21', 'catwoman@gmail.com', 'cat1521');


INSERT INTO blog_entries (title, blog_description, markdown, blogger_id)
VALUES ('First Post', 'This is my very first blog', 'whatever', 6);

INSERT INTO blog_entries (title, blog_description, markdown, blogger_id)
VALUES ('Second Post', 'This is my secong blog', 'whatever again', 6);

CREATE USER bolster21 WITH PASSWORD 'bolster1521';

GRANT SELECT, INSERT, UPDATE, DELETE ON blog_entries TO bolster21; 
GRANT USAGE, SELECT ON SEQUENCE blog_entries_id_seq TO bolster21;
