var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
	db.runSql( "CREATE TABLE domainmetadata (" +
		"id					SERIAL PRIMARY KEY," +
		"domain_id	INT REFERENCES domains(id) ON DELETE CASCADE," +
		"kind				VARCHAR(32)," +
		"content		TEXT" +
		");", callback );
};

exports.down = function(db, callback) {
	db.dropTable( 'domainmetadata', callback );
};
