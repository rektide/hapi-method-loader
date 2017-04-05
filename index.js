#!/usr/bin/env node

import { default as _ } from "lodash"
import { default as path } from "path"
import { fs } from "mz"
import { default as dirReader } from "dir-reader"

export const defaults= {
	path: `${process.cwd()}${path.sep}plugins`,
	verbose: false,
	autoLoad: true
}

export const register= ( server, options, next) => {
	pluginLoader( server, options, next, true);
}
register.attributes = {
	pkg: require( __dirname+ path.sep+ "package.json")
}

export function pluginLoader( server, options, next, useAsPlugin) {
	const load = async( passedOptions)=>{
		const settings= _.defaults( passedOptions, defaults);
		settings.path= path.normalize( path.resolve( settings.path));

		// get all files (at any level) underneath the plugins directory:
		var
		  fileNames= await new dirReader( settings.path, {include: "\.js$"}),
		  modules= fileNames.map( file=> import( settings.path+"/"+ file)),
		  all= await Promise.all(modules)
		all.forEach(( module, i)=> {
			if( !module.attributes){
				module.attributes= {}
			}
			if( !module.attributes.name){
				const file= fileNames[ i]
				module.attributes.name= file.substring( 0, file.length- 3)
			}
			if( !module.attributes.version){
				module.attributes.version= "1.0.0"
			}
		})
		return server.register( all)
	}
	if (useAsPlugin) {
		server.expose("load", (passedOptions, loadDone)=> load( passedOptions).then().then( loadDone, loadDone));
	}
	if (options.autoLoad === false) {
		return next()
	}
	load( options).then(function(){}).then( next, next)
};
