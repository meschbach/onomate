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
-- PowerDNS Example Schema
-- http://doc.powerdns.com/html/generic-mypgsql-backends.html @ 2014-04-05
--
BEGIN; 
INSERT INTO schema_migrations ( version, description ) SELECT 1, 'PowerDNS default schema (no DNSSEC)' WHERE NOT EXISTS( SELECT version FROM schema_migrations WHERE version = 1 ); 
INSERT INTO schema_migration_log ( migration_type, migration_version ) VALUES( 0, 1 );

create table domains (
 id              SERIAL PRIMARY KEY,
 name            VARCHAR(255) NOT NULL,
 master          VARCHAR(128) DEFAULT NULL,
 last_check      INT DEFAULT NULL,
 type            VARCHAR(6) NOT NULL,
 notified_serial INT DEFAULT NULL,
 account         VARCHAR(40) DEFAULT NULL,
 CONSTRAINT c_lowercase_name CHECK (((name)::text = lower((name)::text)))
);
CREATE UNIQUE INDEX name_index ON domains(name);

CREATE TABLE records (
        id              SERIAL PRIMARY KEY,
        domain_id       INT DEFAULT NULL,
        name            VARCHAR(255) DEFAULT NULL,
        type            VARCHAR(10) DEFAULT NULL,
        content         VARCHAR(65535) DEFAULT NULL,
        ttl             INT DEFAULT NULL,
        prio            INT DEFAULT NULL,
        change_date     INT DEFAULT NULL,
        disabled        BOOL DEFAULT 'f',
        CONSTRAINT domain_exists
        FOREIGN KEY(domain_id) REFERENCES domains(id)
        ON DELETE CASCADE,
        CONSTRAINT c_lowercase_name CHECK (((name)::text = lower((name)::text)))
);

CREATE INDEX rec_name_index ON records(name);
CREATE INDEX nametype_index ON records(name,type);
CREATE INDEX domain_id ON records(domain_id);

create table supermasters (
          ip INET NOT NULL,
          nameserver VARCHAR(255) NOT NULL,
          account VARCHAR(40) DEFAULT NULL,
          PRIMARY KEY (ip, nameserver)
);

CREATE TABLE comments (
  id              SERIAL PRIMARY KEY,
  domain_id       INT NOT NULL,
  name            VARCHAR(255) NOT NULL,
  type            VARCHAR(10) NOT NULL,
  modified_at     INT NOT NULL,
  account         VARCHAR(40) DEFAULT NULL,
  comment         VARCHAR(65535) NOT NULL,
  CONSTRAINT domain_exists
  FOREIGN KEY(domain_id) REFERENCES domains(id)
  ON DELETE CASCADE,
  CONSTRAINT c_lowercase_name CHECK (((name)::text = lower((name)::text)))
);
CREATE INDEX comments_domain_id_idx ON comments (domain_id);
CREATE INDEX comments_name_type_idx ON comments (name, type);
CREATE INDEX comments_order_idx ON comments (domain_id, modified_at);
END;
