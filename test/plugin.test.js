'use strict';
const Code = require('code'); // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Hapi = require('hapi');
const pluginLoader = require('../');
const path = require('path');

lab.experiment('hapi-plugin-loader', () => {
	lab.test('will not crash if path does not exist', (done) => {
		const server = new Hapi.Server({
			debug: {
				log: ['error', 'hapi-plugin-loader']
			}
		});
		server.connection({ port: 3000 });
		server.register({
			register: pluginLoader,
			options: {
				verbose: true,
				path: 'no/no/no/no/no/no/no/no/',
				prefix: 'test'
			},
		}, (err) => {
			Code.expect(err).to.equal(undefined);
			return done();
		});
	});
});

lab.experiment('hapi-plugin-loader', () => {
	let server;
	lab.before((done) => {
		server = new Hapi.Server({
			debug: {
				log: ['error', 'hapi-plugin-loader']
			}
		});
		server.connection({ port: 3000 });
		server.register({
			register: pluginLoader,
			options: {
				verbose: true,
				path: `${__dirname}${path.sep}plugins`,
				prefix: 'test'
			},
		}, (err) => {
			if (err) {
				console.log(err);
				return;
			}
			done();
		});
	});
	lab.test(' loads as a plugin, auto-adds a plugin from a plugins directory and lets you call it', (done) => {
		server.start(() => {
			server.plugins.test.doSomething((someEerr, result) => {
				Code.expect(typeof result).to.equal('string');
				Code.expect(result).to.equal('something');
				server.stop(() => {
					done();
				});
			});
		});
	});
	lab.test('loads as a plugin, lets you call a plugin added to a prefixed namespace correctly', (done) => {
		server.start(() => {
			const result = server.plugins.test.add(1, 1);
			Code.expect(typeof result).to.equal('number');
			Code.expect(result).to.equal(2);
			server.stop(() => {
				done();
			});
		});
	});
});

lab.experiment('hapi-plugin-loader cache', { timeout: 5000 }, () => {
	let server;
	lab.before((done) => {
		server = new Hapi.Server({
			debug: {
				log: ['error', 'hapi-plugin-loader']
			}
		});
		server.connection({ port: 3000 });
		server.register({
			register: pluginLoader,
			options: {
				path: path.join(__dirname, 'cache')
			},
		}, (err) => {
			if (err) {
				throw err;
			}
			done();
		});
	});
	lab.test('supports caching option from a plugin call', (done) => {
		server.start(() => {
			server.plugins.cacheIt((err1, result1) => {
				server.plugins.cacheIt((err2, result2) => {
					setTimeout(() => {
						server.plugins.cacheIt((err3, result3) => {
							Code.expect(result1).to.equal(result2);
							Code.expect(result2).to.not.equal(result3);
							done();
						});
					}, 3000);
				});
			});
		});
	});
});
