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
import java.net.InetAddress;
import java.security.SecureRandom;
import org.openqa.selenium.WebDriver;
import static org.testng.Assert.assertEquals;
import org.testng.annotations.Test;
import org.xbill.DNS.CNAMERecord;
import org.xbill.DNS.DClass;
import org.xbill.DNS.Message;
import org.xbill.DNS.Name;
import org.xbill.DNS.Options;
import org.xbill.DNS.Record;
import org.xbill.DNS.Section;
import org.xbill.DNS.SimpleResolver;
import org.xbill.DNS.Type;

/**
 *
 * @author Mark Eschbach <meschbach@gmail.com>
 * @version 1.0.0
 * @since 0.0.5
 */
public class CreateCNameRecordTests {
    @Test
    public void canResolveRecord() throws Exception {
        AcceptanceTestRunner runner = new AcceptanceTestRunner();
        runner.runUngarded(new AcceptanceScenario() {

            public void run(WebDriver driver, String deployedURL) throws Exception {
                int id = new SecureRandom().nextInt();
                final String systemTestBase = "system-tests.onomate.test";
                final String soaBase = "soa-" + id +"."+ systemTestBase;
                final String ns = "ns." + soaBase;
                final String contactName = "admin." + soaBase;
                final String aTestRecordHost = "record."+soaBase;
                final String aRealTestRecord = soaBase;

                OnomateAssembly assembly = new OnomateAssembly(driver, deployedURL);
                OnomateAssembly.Dashboard board = assembly.gotoLanding().authenticate().newAuthority(soaBase, ns, contactName);
                board.authorityByZone(soaBase).details().createRecord(aTestRecordHost, OnomateAssembly.RecordType.CNAME, aRealTestRecord);

                Options.set("verbose");
                
                SimpleResolver resolver = new SimpleResolver();
                resolver.setAddress(InetAddress.getLocalHost());
                resolver.setPort(9101);
                
                Record query = Record.newRecord(Name.fromString(aTestRecordHost + "."), Type.CNAME, DClass.IN);
                Message question = Message.newQuery(query);
                Message response = resolver.send(question);
                Record responses[] = response.getSectionArray(Section.ANSWER);
                CNAMERecord record = ((CNAMERecord) responses[0]);
                assertEquals(record.getName().toString(), aTestRecordHost+ ".");
                assertEquals(record.getTarget().toString(), aRealTestRecord + ".");
            }
        });
    }
}
