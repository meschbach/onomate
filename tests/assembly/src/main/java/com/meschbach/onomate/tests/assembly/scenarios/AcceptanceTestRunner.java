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

import java.net.MalformedURLException;
import java.net.URL;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

/**
 *
 * @author Mark Eschbach <meschbach@gmail.com>
 * @since 0.0.2
 * @version 0.0.1
 */
public class AcceptanceTestRunner {

    final String deployedURL = "http://localhost:9000";
    final String webDriverHost = "http://127.0.0.1:9515";

    public AcceptanceTestRunner(String arguments[]) {
    }

    public void run(AcceptanceScenario scenario) {
        try {
            WebDriver driver = buildDriver(webDriverHost);
            try {
                scenario.run(driver, deployedURL);
            } finally {
                driver.quit();
            }
        } catch (Throwable t) {
            t.printStackTrace();
        }
    }

    private WebDriver buildDriver(final String webDriverHost) throws MalformedURLException {
        DesiredCapabilities capabilities = DesiredCapabilities.chrome();
        URL hostURL = new URL(webDriverHost);
        WebDriver driver = new RemoteWebDriver(hostURL, capabilities);
        return driver;
    }
}
