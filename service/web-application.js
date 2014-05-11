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
var connect = require( "connect" );

function redirect( url ){
	return function( request, response ){
		response.writeHead( 302, {
			'Location' : url
		});
		response.end();
	}
}

function status_internal_error( response ){
	return function( problem ){
		console.log("Unable to complete request: ", problem);
		response.writeHead( 500, 'Internal error' );
		response.write( problem.toString() );
		response.end( problem.stackTrace );
	}
}

function status_accepted( response ){
	return function(){
		response.writeHead( 201, 'Created', {} );
		response.end();
	}
}

function status_not_found( repsonse ){
	return function(){
		response.writeHead( 404, 'Not Found' );
		response.end();
	}
}

function status_deleted( response ){
	return function(){
		response.writeHead( 204, 'Successfully Deleted' );
		response.end();
	}
}

function WebFacet( config ){
	this.createAuthority = function( request, response ){
		var authority = request.body;
		var valid = authority.fqdn && authority.ns && authority.admin;
		if( !valid ){
			response.writeHead( 422, 'Unprocessable Entity', {} );
			response.end();
		} else {
			var storageOperation = config.storage.createAuthority({
					fqdn: authority.fqdn,
					ns: authority.ns,
					admin: authority.admin
				});
			storageOperation.on('error', status_internal_error( response ) );
			storageOperation.on('done', status_accepted( response ) );
		}
	}.bind( this );

	this.listAuthorities = function( request, response ){
		var query = config.storage.listAllAuthorities();
		query.on('error', status_internal_error( response ) );
		query.on('done', function( zones ){
			response.json( zones );
			response.end();
		});
	}.bind( this );

	this.deleteAuthority = function( request, response ){
		var domain = request.params.authority;
		var deletion = config.storage.deleteAuthority( domain );
		deletion.on('error', status_internal_error( response ));
		deletion.on('not-found', function(){
			response.writeHead( 404, 'No such authority' );
			response.end();
		});
		deletion.on('done', status_deleted( response ));
	}

	this.locateAuthority = function( request, response ){
		var domain = request.params.authority;
		var locator = config.storage.findAuthority( domain );
		locator.on('not-found', status_not_found );
		locator.on('found', function( zone ){
			response.json( [zone] );
			response.end();
		});
		locator.on('error', function( error ){
			console.log("Error encountered", error);
			response.writeHead(500,'Error');

			if( typeof error != String ){
				response.end( JSON.stringify( error ) );
			}else{
				response.end( error );
			}
		});
	}

	this.createResourceRecord = function( request, response ){
		var prototype = request.body;

		var operation = config.storage.createResourceRecord( prototype );
		operation.on('error', status_internal_error );
		operation.on('done', function( record ){
			response.json( record );
		});
	}

	this.deleteResourceRecord = function( request, response ){
		var fqdn = request.params.authority;
		var oid = request.params.oid;

		var operation = config.storage.deleteResourceRecord( fqdn, oid );
		operation.on('error', status_internal_error );
		operation.on('done', status_deleted( response ));
	}

	return this;
}

function express_assembly( application, config ){
	var context = config.context ? config.context : ""; 

	var jsonBodyParser = connect.json();

	var facet = new WebFacet( config );

	application.get( context + "/rest/records", facet.listAuthorities );

	application.get( context + "/rest/records/:authority", jsonBodyParser, facet.locateAuthority );
	application.put( context + "/rest/records/:authority", jsonBodyParser, facet.createAuthority );
	application.delete( context + "/rest/records/:authority", facet.deleteAuthority );

	application.post( context + "/rest/records/:authority/rr", jsonBodyParser, facet.createResourceRecord );
	application.delete( context + "/rest/records/:authority/rr/:oid", jsonBodyParser, facet.deleteResourceRecord );

	application.get( context + "/status", redirect( "/status.html" ) ); 
	application.use( context + "/wui/bower", connect.static( "bower_components/" )  ); 
	application.use( context, connect.static( "browser/" ) );
}

exports.assemble = express_assembly;
