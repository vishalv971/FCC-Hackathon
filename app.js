var firebase = require("firebase");
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var session = require("client-sessions");
var favicon = require('serve-favicon');
//Test COmment
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(favicon(__dirname + '/public/img/glyph.png'));


// FIREBASE CONFIG
var config = {
	apiKey: "AIzaSyCufIc48jvfrtzuichCuQ1TkrfWaF_jzs8",
	authDomain: "fcc-hack.firebaseapp.com",
	databaseURL: "https://fcc-hack.firebaseio.com/",
	projectId: "fcc-hack",
	storageBucket: "fcc-hack.appspot.com",
};

firebase.initializeApp(config);
var ref = firebase.database().ref();

app.use(session({
  	cookieName: 'session',
  	secret: 'kjhkjajdhd89whd',
  	duration: 30 * 60 * 1000,
  	activeDuration: 5 * 60 * 1000,
  	httpOnly: true,
	secure: true,
	ephemeral: true
}));


// ROUTES
app.get("/", function(req, res) {
    res.redirect("/login");
});

app.get("/login", function(req, res) {
	res.render("login");
});

app.post("/login",function(req,res){
		var email = req.body.email;
		var password = req.body.password;

		firebase.auth().signInWithEmailAndPassword(email, password).then(function(user) {
			req.session.user = user;
			res.redirect("/home");
		}).catch(function(error) {
			var errorCode = error.code;
			var errorMessage = error.message;

			if (errorCode === 'auth/wrong-password') {
				console.log('Wrong password...');
			} else {
				console.log(errorMessage);
			}
			console.log(error);
		});
});

app.post("/loginWithGoogle", function(req, res) {
	req.session.user = req.body.user;
	res.send("/home");
});

app.post("/register", function(req, res) {
	res.render("register");
});

app.get("/home", function(req, res) {
	if(!req.session || !req.session.user)
		res.redirect("/login");
	else
    res.render("home");
});

app.get("/events", function(req, res) {
	if(!req.session || !req.session.user)
		res.redirect("/login");

	else {
		ref.once("value").then(function(snap) {
			var json = snap.val();
			var arr = [];

			for(var i in json)
			  arr.push( json[i] );

			res.render("events", {events: arr, removeKey: null});
		});
	}
});

app.post("/events", function(req, res) {
	var event = ref.push();
	event.set({
		name: req.body.name,
		description: req.body.description,
	});

	res.redirect("/events");
});

app.get("/new", function(req, res) {
	if(!req.session || !req.session.user)
		res.redirect("/login");
	else
		res.render("newEvent");
});

app.get("/dashboard", function(req, res) {
	if(!req.session || !req.session.user)
		res.redirect("/login");
	else
		res.render("dashboard");
});

app.get("/about", function(req, res) {
	if(!req.session || !req.session.user)
		res.redirect("/login");
	else
		res.render("about");
});

app.get("/logout", function(req, res) {
	firebase.auth().signOut().then(function() {
		req.session.reset();
		res.redirect("/login");
	},function(error) {
		  console.error('Sign Out Error', error);
	});
});


// SERVER STARTUP
app.listen(3000, "localhost", function() {
    console.log("Server started on port number 3000...");
});
