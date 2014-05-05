/*
 * Copyright 2014 Mark Eschbach
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.meschbach.onomate.tests.assembly.scenarios;

import org.openqa.selenium.WebDriver;
import static org.testng.Assert.*;

/**
 * Given I am an authorized system agent
 * When I request the status resource
 * And the service is running
 * Then I expect the status to state it is running
 *
 * @author Mark Eschbach <meschbach@gmail.com>
 * @version 0.0.2
 * @since 0.0.1
 */
public class StatusAvailable implements AcceptanceScenario{

    public StatusAvailable() {
    }

    public void run(WebDriver driver, String deployedURL) throws Exception {
        OnomateAssembly assembly = new OnomateAssembly(driver, deployedURL);
        String text = assembly.gotoStatus().status();
        assertEquals(text, "Running");
    }

    public static void main(String arguments[]) {
        AcceptanceTestRunner runner = new AcceptanceTestRunner( arguments );
        runner.run(new StatusAvailable());
    }
}
