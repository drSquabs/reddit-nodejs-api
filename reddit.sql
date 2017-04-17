
DROP DATABASE reddit;
CREATE DATABASE reddit;
use reddit;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(60) NOT NULL, 
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  UNIQUE KEY username (username)
);


CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) DEFAULT NULL,
  url VARCHAR(2000) DEFAULT NULL,
  userId INT DEFAULT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  KEY userId (userId), 
  CONSTRAINT validUser FOREIGN KEY (userId) REFERENCES users (id) ON DELETE SET NULL
);


CREATE TABLE subreddits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30),
  description VARCHAR(200),
  createdAt DATETIME,
  updatedAt DATETIME,
  UNIQUE KEY name (name)
);

ALTER TABLE posts
    ADD subredditsId INT,
    ADD FOREIGN KEY subreddit_fk(subredditsId) REFERENCES subreddits(id);


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

CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  postId INT,
  parentId INT,
  text VARCHAR(10000),
  FOREIGN KEY (userId) REFERENCES users (id) ON DELETE SET NULL,
  FOREIGN KEY (postId) REFERENCES posts (id) ON DELETE SET NULL,
  FOREIGN KEY (parentId) REFERENCES comments (id)
);

