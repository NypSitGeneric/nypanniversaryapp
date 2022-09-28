const Express = require("express"),
app = Express();
const exphbs = require('express-handlebars'),
{allowInsecurePrototypeAccess} = require("@handlebars/allow-prototype-access"),
handlebars = require("handlebars");
const { disable } = require("express/lib/application");

app.use(Express.urlencoded({
    extended: false
}));

app.use(Express.json());

app.engine('handlebars', exphbs.engine({
	defaultLayout: 'main',
	handlebars: allowInsecurePrototypeAccess(handlebars),
	helpers: {
		add: function (index) {
			return index + 1;
		},
		logo: function (index) {
			return "logo_" + (index + 1);
		},
		pad: function (number) {
			return number.toString().padStart(4, '0');
		}
	}
}));
app.set('view engine', 'handlebars');

app.use(Express.static("public", {maxAge: 3600000}));

var tiles = Array(1098);
var logoTiles = Array(2);
var sectionIds = [7, 4, 2, 6, 9, 1, 5, 3, 8];
var disabled = {};
var flippedTiles = {};
var logo = false;
var clients = {};
var admins = {};

async function init() {
	console.log("init");
	// init tiles
	tiles.fill(false);
	logoTiles.fill(false);
	for(var i = 1; i <= 9; i++) {
		disabled[i] = false;
	}
	for(var i = 1;i<= 1098; i++) {
		flippedTiles[i] = false;
	}
}

app.get("/", (req, res) => {
	if(req.query.id) {
		res.render("lightup", {id: req.query.id, title: `NYP 30th Anniversary Tile ${req.query.id}`});
	}
	else {
		res.render("home", {tiles, logoTiles, logo, title: "NYP 30th Anniversary App"});
	}
});

app.post("/lightup", (req, res) => {
	//if(req.body.id == 480) {
		//logo = true;
		//Object.values(clients).forEach(client => {
		//	client.write(`data: logo\n\n`);
		//});
	//} else {

	if (req.body.id == 1099) {
		Object.values(clients).forEach(client => {
			client.write(`data: logo_1\n\n`);
		});
		res.redirect(`/?id=${id}`);
	} else if (req.body.id == 1100) {
		Object.values(clients).forEach(client => {
			client.write(`data: logo_2\n\n`);
		});
		res.redirect(`/?id=${id}`);
	} else {
		tiles[req.body.id - 1] = true;
		flippedTiles[req.body.id] = true;
		// get section index
		var index = Math.ceil(req.body.id / 122) - 1;
		var id = req.body.id;
		// check if all tiles in section are already flipped
		if(tiles.slice(index * 122, (index + 1) * 122 - 1).every(Boolean)) {
			disabled[sectionIds[index]] = true;
			Object.values(admins).forEach(client => {
				client.write(`data: disable ${sectionIds[index]}\n\n`);
			});
			//}
			Object.values(clients).forEach(client => {
				client.write(`data: ${req.body.id}\n\n`);
			});
		}
		Object.values(clients).forEach(client => {
			client.write(`data: ${req.body.id}\n\n`);
		});
		// res.sendStatus(200);
		//res.render("thankyou", {title: "NYP 30th Anniversary - Thank You"});
		res.redirect(`/?id=${id}`);
		//res.redirect('back');
		//res.sendStatus(200);
		//res.status(200);
	}

});

app.get("/admin", (req, res) => {
	res.render("admin", {title: "NYP 30th Anniversary App Admin"});
});

app.get("/assigntiles", (req, res) => {
	let isFlipped = true;
	let id=0;

	do {

		let key = Object.keys(flippedTiles).filter(key => flippedTiles[key] === false);
		if (key.length <= 0){
			return res.render("thankyou", {id: id, title: "NYP 30th Anniversary"});
		}

		id = Math.floor((Math.random() * 1098) + 1);
		if (flippedTiles[id]==false){
			isFlipped = false;
		}

		key = Object.keys(flippedTiles).filter(key => flippedTiles[key] === false);
		if (key.length <= 0){
			return res.render("thankyou", {id: id, title: "NYP 30th Anniversary"});
		}
	}while(isFlipped);
	res.render("lightup", {id: id, title: `NYP 30th Anniversary Tile ${id}`});
});

app.get("/disabled", (req, res) => {
	res.json(disabled);
});

app.get("/tiles",(req,res) => {
	res.json(flippedTiles);
});

app.post("/reset", (req, res) => {
	tiles.fill(false);
	logoTiles.fill(false);
	for(var i = 1;i<= 1098; i++) {
		flippedTiles[i] = false;
	}
	for(var i = 1; i <= 9; i++) {
		disabled[i] = false;
	}
	logo = false;
	Object.values(clients).forEach(client => {
		client.write(`data: reset\n\n`);
	});
	res.redirect("/admin");
});

app.post("/flipremaining", (req, res) => {
	tiles.fill(true);
	for(var i = 1;i<= 1098; i++) {
		flippedTiles[i] = true;
	}
	Object.values(clients).forEach(client => {
		client.write(`data: remaining\n\n`);
	});
	res.redirect("/admin");
});

app.post("/fliplogo", (req, res) => {
	logo = true;
	Object.values(clients).forEach(client => {
		client.write(`data: logo_${req.body.logo}\n\n`);
	});
	res.redirect("/admin");
});

app.post("/unfliplogo", (req, res) => {
	logo = false;
	Object.values(clients).forEach(client => {
	client.write(`data: unfliplogo\n\n`);
	});
	res.redirect("/admin");
});

// sequence: 7 4 2 6 9 10 1 5 3 8
// last section will have 47 tiles, while the others will have 48
app.post("/flip/:section", (req, res) => {
	// flip tiles in section
	console.log(req.params.section);
	var index = sectionIds.indexOf(parseInt(req.params.section));
	for(var i = index * 122; i <= (index + 1) * 122 - 1; i++) {
		if(i <= 1097) {
			tiles[i] = true;
			flippedTiles[i+1] = true;
		}
	}
	Object.values(clients).forEach(client => {
		client.write(`data: section ${req.params.section}\n\n`);
	});
	disabled[req.params.section] = true;
	res.redirect("/admin");
});

app.get("/connect", (req, res) => {
	console.log("connect");
	// set keep alive
	const headers = {
		'Content-Type': 'text/event-stream',
		'Connection': 'keep-alive',
		'Cache-Control': 'no-cache'
	};
	res.writeHead(200, headers);
	res.write("data: connected\n\n");
	// store res obj
	clients[req.ip] = res;
	// heartbeat
	setInterval(() => res.write("data: ping\n\n"), 5000);
	// remove client using ip address on connection close
	req.on("close", () => {delete clients[req.ip]});
});

app.get("/adminconnect", (req, res) => {
	const headers = {
		'Content-Type': 'text/event-stream',
		'Connection': 'keep-alive',
		'Cache-Control': 'no-cache'
	};
	res.writeHead(200, headers);
	res.write("data: connected\n\n");
	// heartbeat
	setInterval(() => res.write("data: ping\n\n"), 5000);
	admins[req.ip] = res;
});

var port = process.env.PORT || 5000;
app.listen(port, () => {
	init();
	console.log(`server listening on port: ${port}`)
});