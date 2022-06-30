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
		getImg: function (index) {
			index += 1;
			var newIndex = index;
			if(index >= 157) newIndex += 3;
			if(index >= 162) newIndex += 3;
			if(index >= 167) newIndex += 3;
			if(index >= 172) newIndex += 3;
			if(index >= 177) newIndex += 3;
			if(index >= 182) newIndex += 3;
			if(index >= 187) newIndex += 3;
			if(index >= 192) newIndex += 3;
			if(index >= 197) newIndex += 3;
			if(index >= 202) newIndex += 3;
			if(index >= 207) newIndex += 3;
			if(index >= 212) newIndex += 3;
			if(index >= 217) newIndex += 3;
			if(index >= 222) newIndex += 3;
			if(index >= 227) newIndex += 3;
			if(index >= 232) newIndex += 3;
			if(index >= 237) newIndex += 3;
			if(index >= 242) newIndex += 3;
			if(index >= 247) newIndex += 3;
			return (newIndex).toString().padStart(2, "0");
		}
	}
}));
app.set('view engine', 'handlebars');

app.use(Express.static("public", {maxAge: 3600000}));

var tiles = Array(479);
var sectionIds = [7, 4, 2, 6, 9, 10, 1, 5, 3, 8];
var disabled = {};
var logo = false;
var clients = {};
var admins = {};

async function init() {
	console.log("init");
	// init tiles
	tiles.fill(false);
	for(var i = 1; i <= 10; i++) {
		disabled[i] = false;
	}
}

app.get("/", (req, res) => {
	if(req.query.id) {
		res.render("lightup", {id: req.query.id, title: `NYP 30th Anniversary Tile ${req.query.id}`});
	}
	else {
		res.render("home", {tiles, logo, title: "NYP 30th Anniversary App"});
	}
});

app.post("/lightup", (req, res) => {
	if(req.body.id == 480) {
		logo = true;
		Object.values(clients).forEach(client => {
			client.write(`data: logo\n\n`);
		});
	} else {
		tiles[req.body.id - 1] = true;
		// get section index
		var index = Math.ceil(req.body.id / 48) - 1;
		// check if all tiles in section are already flipped
		if(tiles.slice(index * 48, (index + 1) * 48 - 1).every(Boolean)) {
			disabled[sectionIds[index]] = true;
			Object.values(admins).forEach(client => {
				client.write(`data: disable ${sectionIds[index]}\n\n`);
			});
		}
		Object.values(clients).forEach(client => {
			client.write(`data: ${req.body.id}\n\n`);
		});
	}
	// res.sendStatus(200);
	res.render("thankyou", {title: "NYP 30th Anniversary - Thank You"});
	//res.redirect("/");
});

app.get("/admin", (req, res) => {
	res.render("admin", {title: "NYP 30th Anniversary App Admin"});
});

app.get("/disabled", (req, res) => {
	res.json(disabled);
});

app.post("/reset", (req, res) => {
	tiles.fill(false);
	for(var i = 1; i <= 10; i++) {
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
	Object.values(clients).forEach(client => {
		client.write(`data: remaining\n\n`);
	});
	res.redirect("/admin");
});

app.post("/fliplogo", (req, res) => {
	logo = true;
	Object.values(clients).forEach(client => {
		client.write(`data: logo\n\n`);
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
	var index = sectionIds.indexOf(parseInt(req.params.section));
	for(var i = index * 48; i <= (index + 1) * 48 - 1; i++) {
		if(i <= 478) tiles[i] = true;
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