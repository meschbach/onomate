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
												done();
												self.emit('done', record);
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

function LocateAuthority( config, fqdn ){
	if( fqdn === undefined ){ throw new Error("fqdn is not defined" ); }

	var self = this;
	events.EventEmitter.call( this );

	(function perform(){
		pg.connect( config, function( error, connection, done ){
			if( error ){
				console.log( "Locate authority error", error); 
				self.emit('error', error);
				done();
				return;
			}

			connection.query( "SELECT content FROM records WHERE type = 'SOA' and name = $1::text", [fqdn], 
				function( err, result ){
					if( err ){
						self.emit('error', error);
					}else{
						if( result.rowCount == 0 ){
							self.emit('not-found');
						} else {
							var results = result.rows.map( function( zone ){
								var content = zone.content.split( " " );
								var ns = content[0];
								var admin = content[1];
								var record = { fqdn: fqdn, ns: ns, admin: admin };
								return record;
							});
							self.emit('found', results );
						}
					}
					done();
					self.emit('done');
			});
		});
	})();

	return this;
}
util.inherits( LocateAuthority, events.EventEmitter );

function DeleteAuthority( config, fqdn ){
	if( fqdn === undefined ){ throw new Error("fqdn is not defined" ); }

	var self = this;
	events.EventEmitter.call( this );

	(function perform(){
		pg.connect( config, function( error, connection, done ){
			if( error ){
				console.log( "delete error ", error );
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

function LocateZoneResources( config, fqdn ){
	if( fqdn === undefined ){ throw new Error("fqdn is not defined" ); }

	var self = this;
	events.EventEmitter.call( this );

	(function perform(){
		pg.connect( config, function( error, connection, done ){
			if( error ){
				console.log( "Locate authority error", error); 
				self.emit('error', {what: error, when: 'obtaining connection', who: 'LocateZoneResources'});
				done();
				return;
			}

			connection.query( "SELECT records.name, records.type, content FROM records INNER JOIN domains ON records.domain_id = domains.id WHERE domains.name = $1::text AND records.type != 'SOA'", [fqdn], 
				function( err, result ){
					if( err ){
						self.emit('error',{what: err, when: 'querying reosurces', who: 'LocateZoneResources'});
					}else{
						if( result.rowCount == 0 ){
							self.emit('not-found');
						} else {
							var results = result.rows.map( function( row ){
								return {
									host: row.name,
									type: row.type,
									data: row.content,
									fqdn: fqdn
								};
							});
							self.emit('found', results );
						}
					}
					done();
					self.emit('done');
			});
		});
	})();

	return this;
}
util.inherits( LocateZoneResources, events.EventEmitter );

function LocateAuthorityDetails( config, fqdn ){
	if( fqdn === undefined ){ throw new Error("fqdn is not defined" ); }

	var self = this;
	events.EventEmitter.call( this );

	var resourceRecords, zone;

	var failed = false;
	function fail_both( error ){
		failed = true;
		self.emit('error', error );
	}

//TODO: Find a library which handles this for us, or extract to a library
	var total = 2;
	function done_guard(){
		total--;
		if( total == 0 ){
			if( !failed ){
				if( zone ){
					zone.resources = resourceRecords;
					self.emit('found', zone );
				}else{
					self.emit('not-found');
				}
			}
			self.emit('done');
		}
	}

	var resourceLocator = new LocateZoneResources( config, fqdn )
	.on( 'error', fail_both )
	.on( 'found', function( resources ){
		resourceRecords = resources;
	})
	.on( 'done', done_guard );

	new LocateAuthority( config, fqdn )
	.on('error', fail_both )
	.on('found', function( zoneSummary ){ zone = zoneSummary[0]; })
	.on('done', done_guard );

	return this;
}
util.inherits( LocateAuthorityDetails, events.EventEmitter );

function CreateResourceRecord( config, record ){
	events.EventEmitter.call( this );
	var self = this;
	(function start(){
		pg.connect( config, function( error, connection, done ){
			if( error ){
				console.log( "create error ", error );
				self.emit( "error", error );
			}else{
				connection.query( "INSERT INTO records( \"domain_id\",\"name\", \"type\", \"content\" ) SELECT id as domain_id,  $1::text, $2::text, $3::text FROM domains WHERE name = $4::text",
					[ record.host, record.type, record.data, record.fqdn ],
					function( error, result ){
						if( error ) { done(); self.emit('error', error ); }else{
							done();
							self.emit('done', record);
						}
					});
			}
		});
	})();

	return this;
}
util.inherits( CreateResourceRecord, events.EventEmitter );

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
	this.findAuthority = function( fqdn ){
		return new LocateAuthorityDetails( configuration, fqdn );
	}
	this.createResourceRecord = function( record ){
		return new CreateResourceRecord( configuration, record );
	}
	return this;
}

exports.createEngine = function( configuration ){
	return new StorageEngine( configuration );
}

