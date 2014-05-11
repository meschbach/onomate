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

onomate.config(["$routeProvider", function( $routeProvider ){
	$routeProvider
		.when('/authorities', {
			templateUrl: 'authorities.html',
			controller: 'AuthoritiesScreen'
		})
		.when('/zone/:fqdn', {
			templateUrl: 'zone.html',
			controller: 'ZoneScreen'
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
	var ResourceRecord = $resource("/rest/records/:fqdn/rr/:id",
		{fqdn: '@fqdn', id: '@id' }
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

	(function start(){
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
	})();

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
		dto.$save();
	}
	return this;
}]);

onomate.controller( "AuthoritiesScreen", [function(){}] );

onomate.controller( "ZonesPresenter", [ "$scope", "AuthorityZones", function( $scope, authorities ){
	$scope.zones = [];

	var newZoneListener = authorities.on('new-zone', function( zone ){
		$scope.zones.push( zone );
	});
	authorities.on('deleted-zone', function( zone ){
		$scope.zones = authorities.zones;
	});

	$scope.deleteZone = function( target ){
		authorities.delete( target.fqdn );
	}

	$scope.details = function( zone ){
	}

	$scope.$on('$destroy', function(){
		newZoneListener.remove();
	});
}]);

onomate.controller( "NewZone", ["$scope", "AuthorityZones", function( $scope, authorities ){
	$scope.addZone = function(){
		authorities.createZone( $scope );
	}
}]);


onomate.controller('ZoneScreen', ["$scope", "$routeParams", "AuthorityZones", function( $scope, $routeParams, authorities ){
	$scope.fqdn = $routeParams.fqdn;
	$scope.rr = [];

	authorities.load_zone( $scope.fqdn ).on('loaded', function( zone ){
		$scope.rr = zone.resources ? zone.resources : [];
	});
	authorities.on('new-resource', function( event ){
		var fqdn = event.zone;
		if( $scope.fqdn == fqdn ){
			var record = event;
			$scope.rr.push(record);
		}
	});

	$scope.addResource = function( record ){
		authorities.createResource( $scope.fqdn, record );
	}
}]);

onomate.controller('CreateResourceRecord', ["$scope", function( $scope ){
	$scope.record = {};

	$scope.types = ["A", "CNAME", "NS"];

	$scope.addRR = function( ){
		$scope.addResource( $scope.record );
		$scope.record.host = "";
		$scope.record.data = "";
	}
}]);

