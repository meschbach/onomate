/*
 * Copyright 2014 Mark Eschbach.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.meschbach.onomate.tests.assembly.scenarios;

import com.meschbach.onomate.tests.assembly.scenarios.OnomateAssembly.ResourceRow;
import com.meschbach.onomate.tests.assembly.scenarios.OnomateAssembly.Zone;
import java.util.UUID;
import org.openqa.selenium.WebDriver;
import static org.testng.Assert.*;

/**
 *
 * @author Mark Eschbach <meschbach@gmail.com>
 * @since 0.0.3
 * @version 0.0.2
 */
public class CreateARecord implements AcceptanceScenario{

    public CreateARecord() {
    }

    public void run(WebDriver driver, String deployedURL) throws Exception {
        final UUID randomUUID = UUID.randomUUID();
        final String id = randomUUID.toString();
        final String zoneName = "soa-"+ id + ".assembly-tests.onomate.test";
        final String nameServer = "ns-"+id +".assembly-tests.onomate.test";
        final String contactEmail = "mail-" +id +"assembly-test.soa.test";
        final String aName = "a."+zoneName;
        final String ipv4Host = "127.0.0.200";

        OnomateAssembly assembly = new OnomateAssembly(driver, deployedURL);
        OnomateAssembly.Dashboard dashboard = assembly.gotoLanding().authenticate();
        dashboard.newAuthority(zoneName, nameServer, contactEmail);
        OnomateAssembly.Authority authority = dashboard.authorityByZone(zoneName);
        Zone details = authority.waitOnPersisted().details();
        ResourceRow row = details.createARecord(aName, ipv4Host).getResource(aName);
        assertEquals(row.host(), aName);
        assertEquals(row.type(), "A");
        assertEquals(row.value(), ipv4Host);
    }
    
    public static void main( String arguments[] ){
        AcceptanceTestRunner runner = new AcceptanceTestRunner(arguments);
        runner.run(new CreateARecord());
    }
}
