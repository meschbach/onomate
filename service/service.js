/*
 * Copyright 2014 Mark Eschbach
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Primary Application Entry Point
 */
var express = require( "express" );
var connect = require( "connect" );
var morgan = require( "morgan" );

var pgStorage = require( __dirname + "/pg-storage" );
var webApp = require( __dirname + "/web-application" );

/*
 * Figure out the configuration file
 */
var config = (function(){
	var yargs = require( "yargs" ).argv;
	var result;
	if( yargs.config ){
		var configFile = yargs.config;
		console.log("Loading configuration ", configFile);
		result = require( configFile );
	} else {
		result = {};
	}
	return result;
})();

/*
 * Driving Application
 */
var express_application = express();
express_application.use( morgan('tiny') );

var storageEngine = pgStorage.createEngine( config.storage || {} );

webApp.assemble( express_application, {
	storage: storageEngine
} );

var port = (config.http || {} ).port || 9000;
express_application.listen( port, function(){
	console.log( "Running on ", port );
});

