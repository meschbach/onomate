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
var onomate = angular.module( "Onomate", [ "ngResource", "ngRoute" ]);

onomate.config(["$routeProvider", "$locationProvider", function( $routeProvider, $locationProvider ){
	$locationProvider.html5Mode( true );
	$routeProvider
		.when('/authorities', {
			templateUrl: 'authorities.html',
			controller: 'AuthoritiesScreen'
		})
		.when('/zone/:fqdn', {
			templateUrl: 'zone.html',
			controller: 'ZoneScreen'
		})
		.when('/about', {
			templateUrl: 'about.html',
			controller: 'AboutScreen'
		})
		.otherwise({ redirectTo: '/authorities' });
}]);

onomate.service( "Event", [ function( ){
	function EventQueue(){
		var listeners = []; 

		function EventListener( target ){
			
			//TODO: In thoery this could jsut dispatch through
			this.invoke = function( event ){
				target( event );
			}
			this.remove = function(){
				var self = this;
				listeners = listeners.filter( function( listener ){
					return listener != self;
				});
			}
			return this;
		}

		this.on = function( callback ){
			var listener = new EventListener( callback );
			listeners.push( listener );
			return listener;
		}

		this.emit = function( event ){
			listeners.forEach( function( listener ){
				listener.invoke( event );
			});
		}
		return this;
	}

	function Multiplexer(){
		var events = {};

		this.on = function( name, listener ){
			var queue = events[name];
			if( !queue ){
				queue = new EventQueue();
				events[name] = queue;
			}
			return queue.on( listener );
		}
		this.emit = function( name, event ){
			var queue = events[name];
			if( queue ){
				queue.emit( event );
			}
		}
		this.attach_to = function( object ){
			object.on = this.on.bind(this);
		}
	}
	this.Multiplexer = Multiplexer;
	this.Queue = EventQueue;
	return this;
}]);

onomate.service( "AuthorityZones", [ "Event", "$resource", function AuthorityZones( Event, $resource ){
	var self = this;
	var events = new Event.Multiplexer();
	this.zones = [];

	var StartOfAuthority = $resource('/rest/records/:fqdn', 
		{fqdn: '@fqdn'},
			{'save': {method: 'put'}
			});
	var ResourceRecord = $resource("/rest/records/:fqdn/rr/:oid",
		{fqdn: '@fqdn', oid: '@oid' }
			);

	this.createZone = function( prototype ){
		var zone = {
			fqdn: prototype.fqdn,
			nameServer: prototype.nameServer,
			administrator: prototype.administrator,
			state: 'creating'
		};

		this.addZone( zone );
		/*
		 * Post the request
		 */
		var record = new StartOfAuthority({
			fqdn: zone.fqdn,
			ns: zone.nameServer,
			admin: zone.administrator
		});	
		record.$save( function(){
			zone.state = 'Persisted';
		} );
	}

	this.addZone = function( zone ){
		this.zones.push( zone );

		/*
		 * Notify the UI we have a new event
		 */
		events.emit( 'new-zone', zone );
	}

	this.on = events.on.bind(events);

	this.loadZones = function(){
		StartOfAuthority.query( function( all ){
			all.forEach( function( zone ){
				var record = {
					fqdn: zone.fqdn,
					nameServer: zone.ns,
					administrator: zone.admin,
					state: 'importing'
				}
				self.addZone( record );
				record.state = 'Persisted';
			});
		});
	}

	this.delete = function( fqdn ){
		var self = this;
		var resource = new StartOfAuthority({ fqdn: fqdn });
		resource.$delete( function(){
			self.zones = self.zones.filter( function( element ){
				return element.fqdn != fqdn;
			});
			events.emit( 'deleted-zone', fqdn );
		});
	}

	function LoadZoneViaRest( fqdn ){
		var dispatcher = new Event.Multiplexer();
		dispatcher.attach_to(this);

		StartOfAuthority.query({fqdn: fqdn}, function( authority ){
			var zone = authority[0];
			zone.resources = zone.resources || [];
			zone.resources.forEach( function( record ){
				record.status = 'loaded';
			});
			dispatcher.emit( "loaded", zone );
			dispatcher.emit( "done" );
		});
		return this;
	}

	this.load_zone = function( fqdn ){
		return new LoadZoneViaRest( fqdn );
	}

	this.createResource = function( fqdn, resource ){
		var record = {
			type: resource.type || 'A',
			host: resource.host,
			data: resource.data,
			zone: fqdn,
			status: 'new'
		};
		events.emit( 'new-resource', record);

		var dto = new ResourceRecord();
		dto.type = record.type;
		dto.host = record.host;
		dto.data = record.data;
		dto.fqdn = record.zone;
		dto.$save( function( response ){
			record.oid = response.oid; 
			record.status = 'Persisted';
		});
	}

	this.deleteResource = function( resource ){
		var fqdn = resource.fqdn || resource.zone;
		if( !fqdn ){ throw new Error( "Excepted fully qualified domain name or zone as apart of the resource" );}
		resource.status = 'deleting';
		var restCall = new ResourceRecord({fqdn: fqdn, oid: resource.oid});
		restCall.$remove( function(){
			resource.status = 'deleted';
			events.emit('resource:deleted', resource );
		}, function(){
			resource.status='deletion failed';
			console.log('Deletion failed', arguments, resource);
		} );
	}
	return this;
}]);

onomate.controller( "AuthoritiesScreen", [function(){}] );

onomate.controller( "ZonesPresenter", [ "$scope", "AuthorityZones", function( $scope, authorities ){
	$scope.zones = [];

	function listen( to, eventName, callback ){
		var subscription = to.on(eventName, callback);
		$scope.$on('$destroy', function(){ subscription.remove(); } );
	}

	listen( authorities, 'new-zone', function( zone ){
		$scope.zones.push( zone );
	});
	listen( authorities, 'deleted-zone', function( zone ){
		$scope.zones = authorities.zones;
	});
	
	authorities.loadZones();
}]);

onomate.controller( "NewZone", ["$scope", "AuthorityZones", function( $scope, authorities ){
	$scope.addZone = function(){
		authorities.createZone( $scope );
	}
}]);


onomate.controller('ZoneScreen', ["$scope", "$routeParams", "AuthorityZones", "$location", function( $scope, $routeParams, authorities, $location ){
	$scope.fqdn = $routeParams.fqdn;
	$scope.rr = [];

	authorities.load_zone( $scope.fqdn ).on('loaded', function( zone ){
		$scope.nameServer = zone.ns;
		$scope.administrator = zone.admin;
		$scope.rr = zone.resources ? zone.resources : [];
	});
	authorities.on('new-resource', function( event ){
		var fqdn = event.zone;
		if( $scope.fqdn == fqdn ){
			var record = event;
			$scope.rr.push(record);
		}
	});
	authorities.on('resource:deleted', function( event ){
		var fqdn = event.zone || event.fqdn;
		if( $scope.fqdn == fqdn ){
			$scope.rr = $scope.rr.filter( function( record ){
				return record != event;
			});
		}
	});

	$scope.addResource = function( record ){
		authorities.createResource( $scope.fqdn, record );
	}

	$scope.deleteResource = function( record ){
		authorities.deleteResource( record );
	}
	$scope.deleteZone = function(){
		authorities.delete( $scope.fqdn );
		$location.path('/authorities');
	}
}]);

onomate.controller('CreateResourceRecord', ["$scope", function( $scope ){
	$scope.record = {};

	$scope.types = ["A", "CNAME", "NS", "PTR"];

	$scope.addRR = function( ){
		$scope.addResource( $scope.record );
		$scope.record.host = "";
		$scope.record.data = "";
	}
}]);

onomate.controller( 'AboutScreen', ['$scope', function( $scope ){
}]);

