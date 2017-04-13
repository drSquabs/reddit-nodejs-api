-- This creates the users table. The username field is constrained to unique
-- values only, by using a UNIQUE KEY on that column
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(60) NOT NULL, -- why 60??? ask me :)
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  UNIQUE KEY username (username)
);

-- This creates the posts table. The userId column references the id column of
-- users. If a user is deleted, the corresponding posts' userIds will be set NULL.
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) DEFAULT NULL,
  url VARCHAR(2000) DEFAULT NULL,
  userId INT DEFAULT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  KEY userId (userId), -- why did we add this here? ask me :)
  CONSTRAINT validUser FOREIGN KEY (userId) REFERENCES users (id) ON DELETE SET NULL
);


--CREATE TABLE subReddits

CREATE TABLE subreddits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30),
  description VARCHAR(200),
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE UNIQUE INDEX unique_name
on subreddits (name);

ALTER TABLE posts
    ADD subredditsId INTEGER,
    ADD CONSTRAINT FOREIGN KEY (subredditsid) REFERENCES subreddits(id);

-- SELECT posts.id, title, url, posts.createdAt, posts.updatedAt, users.id AS userId2, username, users.createdAt AS usersCreatedAt, users.updatedAt AS usersUpdatedAt
--             FROM posts
--             LEFT JOIN users ON posts.userId = users.id
--             LEFT JOIN subreddits ON posts.subredditId = subreddits.id
--             ORDER BY createdAt DESC
--             LIMIT 25


CREATE TABLE votes (
  userId INT,
  postId INT,
  voteDirection TINYINT,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (userId, postId),
  KEY userId (userId),
  KEY postId (postId),
  CONSTRAINT FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT FOREIGN KEY (postId) REFERENCES posts (id) ON DELETE CASCADE
);

