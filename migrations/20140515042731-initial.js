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
var dbm = require('db-migrate');
var type = dbm.dataType;
var async = require('async');
var fs = require("fs");

exports.up = function(db, callback) {
	var seedSQL = fs.readFileSync(__dirname + "/pdns-seed.sql", {encoding: 'utf-8'});
	db.runSql( seedSQL, callback );
};

exports.down = function(db, callback) {
	async.series([
		db.dropTable.bind( db, "comments" ),
		db.dropTable.bind( db, "supermasters" ),
		db.dropTable.bind( db, "records" ), 
		db.dropTable.bind( db, "domains" ),
	], callback);
};
