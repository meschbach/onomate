Onomate - DNS Manager

= Name = 
In the words of my friend S.Simonton:
"Onomate? Sounds like automate but refers to onomatology. Also it's yr mate like yr friend in naming things. Also yr question is so meta"

= Schema =
Only backend currently supported is PostgreSQL.  'cause an Elephant never forgets.
Install using the sequence of number scripts in orders.

= License =
Licensed under the Apache 2.0 License, copyright 2014 by Mark Eschbach.  Please see LICENSE and NOTICE for additional details.

= Application Stack =
== Browser Tier ==
Angular + Bower

== Service Tier ==
Express 4.0 over NodeJS

== Persistance ==
PostgreSQL

= Assembly Integration Testing =
Currently there are assembly level acceptance tests under test/assembly.  The name assembly was chosen because the serivce should be able to live within a larger node web application, or at least configurable from a Node driver.

The tests are currently hardwired to assume the test service is running on 9000 locally with a Selenium Web Driver on 9515.

To run the tests use maven, it will grab all of the dependencies and run the testing suite.
