"use strict";
import * as Hapi from "hapi"
import { install as sourceMapInstall } from "source-map-support"

sourceMapInstall()

const server = new Hapi.Server({
	debug: {
		log: ["error", "hapi-method-loader"]
	}
});
server.connection({ port: 5040 });

process.on("uncaughtException", err=> {console.log(err); process.exit(1)})

server.register({
	register: require("../"),
	options: {
		verbose: true,
	}
}, (err) => {
	if (err) {
		console.error("Failed to load a plugin:", err);
		return;
	}
	server.start((err) => {
		//server.methods.test.doSomething((doSomethingErr, result) => {
		console.log("ok")
	});

	console.log("Server running at:", server.info.uri);
});
