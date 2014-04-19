var onomate = angular.module( "Onomate", [] );


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

onomate.service( "AuthorityZones", [ "EventMultiplexer", function( events ){
	var zones = [];

	this.addZone = function( prototype ){
		var zone = {
			fqdn: prototype.fqdn,
			nameServer: prototype.nameServer,
			administrator: prototype.administrator
		};
		zones.push( zone );
		events.emit( 'new-zone', zone );
	}

	this.on = events.on.bind(events);
	return this;
}]);

onomate.controller( "ZonesPresenter", [ "$scope", "AuthorityZones", function( $scope, authorities ){
	$scope.zones = [];

	authorities.on('new-zone', function( zone ){
		$scope.zones.push( zone );
	});

	$scope.$on('$destroy', function(){
	});
}]);

onomate.controller( "NewZone", ["$scope", "AuthorityZones", function( $scope, authorities ){
	$scope.addZone = function(){
		authorities.addZone( $scope );
	}
}]);
