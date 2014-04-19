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
 */
var express = require( "express" );
var connect = require( "connect" );

function redirect( url ){
	return function( request, response ){
		response.writeHead( 302, {
			'Location' : url
		});
		response.end();
	}
}

function onomate_express_assembly( application, a_context ){
	var context = a_context ? a_context : ""; 
	application.get( context + "/status", redirect( "/status.html" ) ); 
	application.use( context + "/wui/bower", connect.static( "bower_components/" )  ); 
	application.use( context, connect.static( "browser/" ) );
}

var express_application = express();
express_application.use( connect.logger('tiny') );

onomate_express_assembly( express_application );

var port = 9000;
express_application.listen( port, function(){
	console.log( "Running on ", port );
});

