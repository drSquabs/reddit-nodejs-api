'use strict';
var bcrypt = require('bcrypt-as-promised');
var HASH_ROUNDS = 10;

class RedditAPI {
    constructor(conn) {
        this.conn = conn;
    }

    createUser(user) {
        /*
        first we have to hash the password. we will learn about hashing next week.
        the goal of hashing is to store a digested version of the password from which
        it is infeasible to recover the original password, but which can still be used
        to assess with great confidence whether a provided password is the correct one or not
         */
        return bcrypt.hash(user.password, HASH_ROUNDS)
            .then(hashedPassword => {
                return this.conn.query('INSERT INTO users (username, password, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())', [user.username, hashedPassword]);
            })
            .then(result => {
                return result.insertId;
            })
            .catch(error => {
                // Special error handling for duplicate entry
                if (error.code === 'ER_DUP_ENTRY') {
                    throw new Error('A user with this username already exists');
                }
                else {
                    throw error;
                }
            });
    }

    createPost(post) {
        if (!post.subredditId) {
            return Promise.reject(new Error("subreddit id must be provided"));
        }
    
        return this.conn.query(
            `
            INSERT INTO posts 
            (userId, title, url, subredditId, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, NOW(), NOW())
            `,
            [post.userId, post.title, post.subredditId, post.url]
        )
            .then(result => {
                return result.insertId;
            });
            
    }
    


    createSubreddit(subreddit) {
    //reference createUser function         
        return this.conn.query(
            `
            INSERT INTO subreddits (id, name, description)
            VALUES (?, ?, ?, ?)`,
            [subreddit.id, subreddit.name, subreddit.description, subreddit.url]
        )
            .then(result => {
                return result.insertId;
            })
            .catch(error => {
                // Special error handling for duplicate entry
                if (error.code === 'P_ENTRY') {
                    throw new Error('A subreddit with this name already exists');
                }
                else {
                    throw error;
                }
            });
    }
    
    //Retrieve subreddits query
    getAllSubreddits() {
        return this.conn.query(
        `
        SELECT id, name, description, createdAt, updatedAt
        FROM subreddits
        ORDER BY createdAt DESC
        LIMIT 25
        `
        )
        .then((function(database_results) {
            
            var transformed_database_results = database_results.map(function(sub) {
                return {
                    id: sub.id,
                    name: sub.name,
                    description: sub.description,
                    createdAt: sub.createdAt,
                    updatedAt: sub.updatedAt
                }
            })
            return transformed_database_results;
        }));
    }

    getAllPosts() {
        /*
        strings delimited with ` are an ES2015 feature called "template strings".
        they are more powerful than what we are using them for here. one feature of
        template strings is that you can write them on multiple lines. if you try to
        skip a line in a single- or double-quoted string, you would get a syntax error.

        therefore template strings make it very easy to write SQL queries that span multiple
        lines without having to manually split the string line by line.
         */
         // we have to add join to this existing query and then run a .map on the results
        return this.conn.query(
            `
            SELECT posts.id, title, url, posts.createdAt, posts.updatedAt, users.id AS userId2, username, 
            users.createdAt AS usersCreatedAt, users.updatedAt AS usersUpdatedAt, posts.subredditsId
            FROM posts
            LEFT JOIN users ON posts.userId = users.id
            LEFT JOIN subreddits ON posts.subredditsId = subreddits.id
            LEFT JOIN votes ON posts.id = votes.postId 
            ORDER BY voteDirection DESC
            LIMIT 25`
        )
        .then((function(database_results) {
            
            var transformed_database_results = database_results.map(function(item) {
                return {
                    id: item.id,
                    title: item.title,
                    url: item.url,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                    user:   {
                        id: item.userId2,
                        username: item.username,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt
                    },
                    subredditId: item.subredditsId
                }
            });
            
            return transformed_database_results;
            
        }));
    } 
    
    createVote(vote) {
        if(voteDirection === 1) {
            return this.conn.query(
            `INSERT INTO votes SET postId=?, userId=?, voteDirection=1 ON DUPLICATE KEY UPDATE voteDirection=?;`
        )
            } else if (voteDirection === 0) {
                return this.conn.query(
            `INSERT INTO votes SET postId=?, userId=?, voteDirection=0 ON DUPLICATE KEY UPDATE voteDirection=?;`
        )
            } else if (voteDirection === -1) {
                return this.conn.query(
            `INSERT INTO votes SET postId=?, userId=?, voteDirection=-1 ON DUPLICATE KEY UPDATE voteDirection=?;`
        )
            } else { 
             return "error! not valid";
            }
        }
    }





module.exports = RedditAPI;