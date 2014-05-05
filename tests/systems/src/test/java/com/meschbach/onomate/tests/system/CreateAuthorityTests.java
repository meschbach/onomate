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

package com.meschbach.onomate.tests.system;

import com.meschbach.onomate.tests.assembly.scenarios.AcceptanceScenario;
import com.meschbach.onomate.tests.assembly.scenarios.AcceptanceTestRunner;
import com.meschbach.onomate.tests.assembly.scenarios.OnomateAssembly;
import com.meschbach.onomate.tests.assembly.scenarios.OnomateAssembly.Dashboard;
import java.security.SecureRandom;
import org.openqa.selenium.WebDriver;
import org.testng.annotations.Test;
import org.xbill.DNS.Lookup;
import org.xbill.DNS.Record;
import org.xbill.DNS.SimpleResolver;
import org.xbill.DNS.Type;
import static org.testng.Assert.*;
import org.xbill.DNS.SOARecord;

/**
 *
 * @author Mark Eschbach <meschbach@gmail.com>
 */
public class CreateAuthorityTests {
    
    @Test
    public void dnsServerRespondsWithAuthority() throws Exception {
        AcceptanceTestRunner runner = new AcceptanceTestRunner();
        runner.runUngarded(new AcceptanceScenario() {

            public void run(WebDriver driver, String deployedURL) throws Exception {
                int id = new SecureRandom().nextInt();
                final String systemTestBase = "system-tests.onomate.test";
                final String soaBase = "soa-"+id+systemTestBase;
                final String ns = "ns."+soaBase;
                final String contactName = "admin."+soaBase;

                OnomateAssembly assembly = new OnomateAssembly(driver, deployedURL);
                Dashboard board = assembly.gotoLanding().authenticate().newAuthority(soaBase, ns, contactName);
                board.authorityByZone(soaBase).waitOnPersisted();
                
                Lookup lookup =  new Lookup(soaBase,Type.SOA);
                SimpleResolver resolver = new SimpleResolver("localhost");
                resolver.setPort(9001);
                lookup.setResolver(resolver);
                lookup.setCache(null);
                Record[] results = lookup.run();
                assertEquals(lookup.getResult(), Lookup.SUCCESSFUL, "Resolution Successful");
                assertNotNull(results);
                assertEquals(results.length, 1);
                SOARecord record  = ((SOARecord)results[0]);
                assertEquals(record.getAdmin().toString(), contactName);
                assertEquals(record.getHost().toString(), ns);
                assertEquals(record.getName().toString(), soaBase);
            }
        });
    }
}
