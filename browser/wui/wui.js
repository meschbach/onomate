var onomate = angular.module( "Onomate", [ "ngResource" ] );


onomate.factory( "EventMultiplexer", [ function( EventQueue ){
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
				queue = EventQueue();
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
	}
	return new Multiplexer();
}]);

onomate.service( "AuthorityZones", [ "EventMultiplexer", "$resource", function( events, $resource ){
	var self = this;
	this.zones = [];

	var StartOfAuthority = $resource('/rest/records/:fqdn', 
		{fqdn: '@fqdn'},
			{'save': {method: 'put'}
			});

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

	return this;
}]);

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

	$scope.$on('$destroy', function(){
		newZoneListener.remove();
	});
}]);

onomate.controller( "NewZone", ["$scope", "AuthorityZones", function( $scope, authorities ){
	$scope.addZone = function(){
		authorities.createZone( $scope );
	}
}]);
