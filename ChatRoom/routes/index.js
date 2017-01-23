var express = require('express');
var router = express.Router();

module.exports = router;
var fs = require('fs');

var sqlite3 = require('sqlite3').verbose();
var userdb = new sqlite3.Database('./user_name.db');
var chatdb = new sqlite3.Database('./user_chat.db');
var exists1 = fs.existsSync('./user_name.db');
var exists2 = fs.existsSync('./user_chat.db');
var nowUser = "";
var id = 1;

userdb.serialize(function(){
	if (!exists1)
		userdb.run("CREATE TABLE user_name (name TEXT, id INTEGER)");
});

chatdb.serialize(function(){
	if (!exists2)
		chatdb.run("CREATE TABLE user_chat (name TEXT, content TEXT, time TEXT) ");
});

router.post('/', function(req, res){
	var stmt = userdb.prepare("INSERT INTO user_name VALUES (?, ?)");
	stmt.run(req.body.username, id+1);
	stmt.finalize();
	res.redirect('/chat');
	res.end();
});

router.get('/', function(req, res){
	res.render('index', {
		title:'FSE-ChatRoom'
	});
});

var url = require('url');
var add_todo = "INSERT INTO user_chat VALUES (?, ?, ?)";
router.get('/chat', function(req, res){

	var posts = [];
	u = url.parse(req.url, true);
	if (typeof(u.query['content'])!=="undefined")
		chatdb.run(add_todo, u.query['name'], u.query['content'], u.query['time']);
	chatdb.serialize(function(err, row){
		chatdb.each('SELECT * FROM user_chat', function(err, row){

			posts.push({name: row.name, content: row.content, time: row.time});
		}, function(){
			//All done fetching records, render response
			res.render('chat', {
				title:'FSE-ChatRoom',
				posts: posts,
				nowUser: nowUser
			});
		});
	})
});

module.exports = router;