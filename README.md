# Onomate - DNS Manager

## Name 
In the words of my friend S.Simonton:
"Onomate? Sounds like automate but refers to onomatology. Also it's yr mate like yr friend in naming things. Also yr question is so meta"

## Usage
The file service/service.js will create the system and requires a configuration file passed via the '--config' option.  A configuration file with every option is shown below:

```javascript
exports.storage = {
	user: 'postgres-user',
	password: 'secret',
	host: 'localhost',
	database: 'onomate-dev'
}
exports.http = {
	port: 9000;
}
```

The configuration file is required(), so you may do whatever environment processing required to produce your configuration.  The storage options are passed directly to the pg library, and any options accepted by pg should be caccepted here.

### Startup
```shell
npm install
./node_moidules/.bin/bower install
node service/service.js --config service/config
```

And launch y'er browser to the port you specified (by default 9000).

## Life Cycle
This is really alpha-quality; but I'll be releasing new features as I need them or others contribute.

## Schema
Only backend currently supported is PostgreSQL.  'cause an Elephant never forgets.
Install using the sequence of number scripts in orders.

I think it would be great if someone would like to maintain a MySQL storage engine, or possibly one of the NoSQL solutions.

## License
Licensed under the Apache 2.0 License, copyright 2014 by Mark Eschbach.  Please see LICENSE and NOTICE for additional details.

## Application Stack
### Browser Tier
Angular + Bower

### Service Tier
Express 4.0 over NodeJS

### Persistance
PostgreSQL

## Assembly Integration Testing
Currently there are assembly level acceptance tests under test/assembly.  The name assembly was chosen because the serivce should be able to live within a larger node web application, or at least configurable from a Node driver.

The tests are currently hardwired to assume the test service is running on 9000 locally with a Selenium Web Driver on 9515.

To run the tests use maven, it will grab all of the dependencies and run the testing suite.

## Security
The system is currently open, however I'm planning on adding a swappable security module with a default configurable database.

