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

import org.testng.annotations.Test;

/**
 *
 * @author Mark Eschbach <meschbach@gmail.com>
 * @since 0.0.3
 * @version 0.0.6
 */
public class AssemblyAcceptanceTests {

    @Test
    public void canCreateAuthority() throws Exception {
        AcceptanceTestRunner runner = new AcceptanceTestRunner();
        runner.runUngarded(new CreateAuthority());
    }

    @Test
    public void providesStatus() throws Exception {
        AcceptanceTestRunner runner = new AcceptanceTestRunner();
        runner.runUngarded(new StatusAvailable());
    }

    @Test
    public void canCreateARecord() throws Exception {
        AcceptanceTestRunner runner = new AcceptanceTestRunner();
        runner.runUngarded(new CreateARecord());
    }
    
    @Test
    public void canCreateNSRecord() throws Exception {
        AcceptanceTestRunner runner = new AcceptanceTestRunner();
        runner.runUngarded(new CreateNSRecord());
    }

    @Test
    public void canCreateCNAMERecord() throws Exception {
        AcceptanceTestRunner runner = new AcceptanceTestRunner();
        runner.runUngarded(new CreateCNameRecord());
    }
}
