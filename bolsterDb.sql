CREATE TABLE blog_entries (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    blog_date DATE DEFAULT CURRENT_DATE,
    blog_description VARCHAR(255),
    markdown VARCHAR(255)
);



INSERT INTO blog_entries (title, blog_description, markdown)
VALUES ('First Post', 'This is my very first blog', 'whatever');

INSERT INTO blog_entries (title, blog_description, markdown)
VALUES ('Second Post', 'This is my secong blog', 'whatever again');

CREATE USER bolsterUser WITH PASSWORD 'bolster1521';
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_entries TO bolsterUser; 
GRANT USAGE, SELECT ON SEQUENCE blog_entries_id_seq TO bolsterUser;
