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

import com.meschbach.onomate.tests.assembly.scenarios.OnomateAssembly.Authority;
import com.meschbach.onomate.tests.assembly.scenarios.OnomateAssembly.Dashboard;
import org.openqa.selenium.WebDriver;
import static org.testng.Assert.*;

/**
 * Given I am an authorized user
 * When I specify a new authority zone "soa.test"
 * Then I see the authority zone "soa.test" in the list of authorities.
 * 
 * @author Mark Eschbach <meschbach@gmail.com>
 * @since 0.0.2
 * @version 0.0.1
 */
public class CreateAuthority {
    private final WebDriver driver;
    private final String deployedURL;

    public CreateAuthority( WebDriver driver, String deployedURL ) {
        this.driver = driver;
        this.deployedURL = deployedURL;
    }
    
    public void run(){
        final String zoneName = "soa.test";
        final String nameServer = "ns.soa.test";
        final String contactEmail = "bender.soa.test";

        OnomateAssembly assembly = new OnomateAssembly(driver, deployedURL);
        Dashboard dashboard = assembly.gotoLanding().authenticate();
        dashboard.newAuthority(zoneName, nameServer, contactEmail);
        Authority authority = dashboard.authorityByZone(zoneName);
        assertEquals(authority.zone(), zoneName);
        assertEquals(authority.nameServer(), nameServer);
        assertEquals(authority.administrator(), contactEmail);
    }
    
    public static void main( String arguments[] ){
        AcceptanceTestRunner runner = new AcceptanceTestRunner(arguments);
        runner.run(new AcceptanceScenario() {

            public void run(WebDriver driver, String deployedURL) throws Exception {
                CreateAuthority authority = new CreateAuthority( driver, deployedURL );
                authority.run();
            }
        });
    }
}
