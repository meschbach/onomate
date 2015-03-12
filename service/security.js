/*
 * Copyright 2015 Mark Eschbach
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
 * Security
 */
var passport = require("passport");
var passportHttp = require("passport-http");

function authenticate_user(username, password, done) {
	if( !this.users ){ return done(null,{ }); }
	var user = this.users[username];
	if ( !user ) { return done( null, false ); }
	if ( !user.password ) { return done( null, false ); }
	if ( user.password != password ) { return done( null, false ); }

	done( null, user );
}

function assemble(container, config) {
	var authenticator = authenticate_user.bind(config);
	passport.use(new passportHttp.BasicStrategy( authenticator ));

	container.require_user = [
		passport.initialize(),
		passport.authenticate('basic', { session: false })
	];
}

exports.assemble = assemble;
