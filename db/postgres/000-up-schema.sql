-- Copyright 2014 Mark eschbach
-- 
-- Licensed under the Apache License, Version 2.0 (the "License");
-- you may not use this file except in compliance with the License.
-- You may obtain a copy of the License at
-- 
--     http://www.apache.org/licenses/LICENSE-2.0
-- 
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS,
-- WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
-- See the License for the specific language governing permissions and
-- limitations under the License.
--
-- Schema version auditing
--
BEGIN;
create table schema_migration_types (
	id BIGINT NOT NULL PRIMARY KEY,
	description TEXT NOT NULL
) WITHOUT OIDS;


create table schema_migrations (
	version BIGINT NOT NULL PRIMARY KEY,
	description TEXT NOT NULL
) WITHOUT OIDS;

create table schema_migration_log (
	id SERIAL PRIMARY KEY,
	migration_type BIGINT NOT NULL REFERENCES schema_migration_types (id),
	when_at TIMESTAMP NOT NULL default now(),
	migration_version BIGINT NOT NULL REFERENCES schema_migrations(version) 
) WITHOUT OIDS;

INSERT INTO schema_migration_types (id, description) VALUES( 0, 'up' ), (1, 'down');
INSERT INTO schema_migrations ( version, description ) SELECT 0, 'schema management log' WHERE NOT EXISTS( SELECT version FROM schema_migrations WHERE version = 0 ); 
INSERT INTO schema_migration_log ( migration_type, migration_version ) VALUES( 0, 0 );

COMMIT;
