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
var pg = require("pg");
var events = require("events");
var util = require("util");

function CreateAuthorityTask( config, record ){
	events.EventEmitter.call( this );
	var self = this;
	function start(){
		pg.connect( config, function( error, connection, done ){
			if( error ){
				console.log( "create error ", error );
				self.emit( "error", error );
			}else{
				connection.query( "INSERT INTO domains( \"name\", \"type\" ) SELECT $1::text, $2::text",
					[ record.fqdn, 'SOA' ],
					function( error, result ){
						if( error ){ 
							done();
							self.emit( "error", error );
						} else {
							var soaContent = record.ns + " " + record.admin + " " + Date.now();
							connection.query( "INSERT INTO records( \"domain_id\",\"name\", \"type\", \"content\", \"ttl\" ) SELECT id as domain_id,  $3::text,'SOA', $1::text, $2::integer FROM domains WHERE name = $3::text",
								[ soaContent, 3600, record.fqdn], function( error, result ){
								if( error ) { done(); self.emit('error', error ); }else{
									connection.query( "INSERT INTO records( \"domain_id\", \"name\", \"type\", \"content\" ) SELECT id as domain_id, $2::text, 'NS', $1::text FROM domains WHERE name = $2::text",
										[ record.ns, record.fqdn], function( error, result ){
											if( error ) { done(); self.emit('error', error ); }else{
												done();
												self.emit('done', record);
											}
										});
								}
								});
						}
					});
			}
		});
	}
	process.nextTick( start );
	return this;
}
util.inherits( CreateAuthorityTask, events.EventEmitter );

function ListAuthorities( config ){
	var self = this;
	events.EventEmitter.call( this );

	(function perform(){
		pg.connect( config, function( error, connection, done ){
			if( error ){
				console.log( "create error ", error );
				self.emit( "error", error );
			}else{
				connection.query( "SELECT name, content FROM records WHERE type = 'SOA'",
					function( error, result ){
						if( error ){ 
							done();
							self.emit( "error", error );
						} else {
							var zoneFormat = result.rows.map( function( zone ){
								var content = zone.content.split( " " );
								var ns = content[0];
								var admin = content[1];
								var record = { fqdn: zone.name, ns: ns, admin: admin };
								return record;
							});
							done();
							self.emit('done', zoneFormat );
						}
					});
			}
		});
	})();

	return this;
}
util.inherits( ListAuthorities, events.EventEmitter );

function DeleteAuthority( config, fqdn ){
	if( fqdn === undefined ){ throw new Error("fqdn is not defined" ); }

	var self = this;
	events.EventEmitter.call( this );

	(function perform(){
		pg.connect( config, function( error, connection, done ){
			if( error ){
				console.log( "create error ", error );
				self.emit( "error", error );
			}else{
				connection.query( "DELETE FROM domains WHERE name = $1::text",
					[ fqdn ],
					function( error, result ){
						if( error ){ 
							done();
							self.emit( "error", error );
						} else {
							done();
							if( result.rowCount == 0 ){
								self.emit('not-found', "Not found");
							}else{
								self.emit('done');
							}
						}
					});
			}
		});
	})();

	return this;
}
util.inherits( DeleteAuthority, events.EventEmitter );

function StorageEngine( configuration ){
	//TODO: Use scoped pool instead of global pool

	this.createAuthority = function( record ){
		return new CreateAuthorityTask( configuration, record );
	}
	this.listAllAuthorities = function(){
		return new ListAuthorities( configuration );
	}
	this.deleteAuthority = function( domain ){
		return new DeleteAuthority( configuration, domain );
	}
	return this;
}

exports.createEngine = function( configuration ){
	return new StorageEngine( configuration );
}

