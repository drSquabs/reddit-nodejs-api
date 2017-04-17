var request = require('request-promise');
var mysql = require('promise-mysql');
var RedditAPI = require('./reddit');

crawl();

function getSubreddits() {
    return request("https://www.reddit.com/.json")
        .then(response => {
            var result = JSON.parse(response);
            // Use .map to return a list of subreddit names (strings) only
            var g = result.data.children.map(names => {
                return names.data.subreddit;
            });
            return g;
        });
}


function getPostsForSubreddit(subredditName) {
    return request(`https://www.reddit.com/r/${subredditName}.json?limit=50`)
        .then(response => {
            var result = JSON.parse(response);
            return result.data.children;

                }).filter(function(post) {
                return !post.data.is_self;
            }).map(function(names) {

                return {
                    title: names.data.title,
                    url: names.data.url,
                    user: names.data.author
                };
            })
            .catch(error => {
                console.log("error!");
        });
}

function crawl() {
        // create a connection to the DB
        var connection = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'reddit',
            connectionLimit: 10
        });

        // create a RedditAPI object. we will use it to insert new data
        var myReddit = new RedditAPI(connection);

        // This object will be used as a dictionary from usernames to user IDs
        var users = {};

        /*
        Crawling will go as follows:
            1. Get a list of popular subreddits
            2. Loop through each subreddit and:
                a. Use the `createSubreddit` function to create it in your database
                b. When the creation succeeds, you will get the new subreddit's ID
                c. Call getPostsForSubreddit with the subreddit's name
                d. Loop thru each post and:
                    i. Create the user associated with the post if it doesn't exist
                    2. Create the post using the subreddit Id, userId, title and url
         */

        // Get a list of subreddits
        getSubreddits()
            .then(subredditNames => {
                subredditNames.forEach(subredditName => {
                    var subId;
                    myReddit.createSubreddit({
                            name: subredditName,
                            description: null
                        })
                        .then(subredditId => {
                            subId = subredditId;
                            return getPostsForSubreddit(subredditName);
                        })
                        .then(posts => {
                            posts.forEach(post => {
                                var userIdPromise;
                                if (users[post.user]) {
                                    userIdPromise = Promise.resolve(users[post.user]);
                                }
                                else {
                                    userIdPromise = myReddit.createUser({
                                        username: post.user,
                                        password: 'abc123'
                                    })
                                    .catch(function(err) {
                                        console.error(err, users[post.user]);
                                        return users[post.user]
                                    });
                                }

                                userIdPromise.then(userId => {
                                    users[post.user] = userId;
                                    return myReddit.createPost({
                                        subredditId: subId,
                                        userId: userId,
                                        title: post.title,
                                        url: post.url
                                    });
                                });
                            });
                        });
                });
       });
}

