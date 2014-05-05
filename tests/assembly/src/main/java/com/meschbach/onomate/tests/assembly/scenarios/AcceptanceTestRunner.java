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

import java.io.FileOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.logging.Level;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.ScreenshotException;

/**
 *
 * @author Mark Eschbach <meschbach@gmail.com>
 * @since 0.0.2
 * @version 0.0.1
 */
public class AcceptanceTestRunner {

    final String deployedURL = "http://localhost:9000";
    final String webDriverHost = "http://127.0.0.1:9515";

    public AcceptanceTestRunner() {
        this(new String[0]);
    }

    public AcceptanceTestRunner(String arguments[]) {
    }

    /**
     * Executes the given scenario within a sandbox to preventing exceptional
     * conditions from leaking out.
     * 
     * @param scenario 
     */
    public void run(AcceptanceScenario scenario) {
        try {
            runUngarded(scenario);
        } catch (Throwable t) {
            t.printStackTrace();
        }
    }
    
    /**
     * Executes the given scenario allowing the client code to handle any
     * resulting exceptions from the scenario.
     * 
     * @param scenario
     * @throws Exception 
     */
    public void runUngarded(AcceptanceScenario scenario) throws Exception {
        WebDriver driver = buildDriver(webDriverHost);
        try {
            scenario.run(driver, deployedURL);
        } catch (OnomateAssembly.WaitTimeoutException problem) {
            captureExceptionScreenshot(problem);
        } finally {
            driver.quit();
        }
    }

    private void captureExceptionScreenshot(OnomateAssembly.WaitTimeoutException problem) {
        problem.printStackTrace(System.err);
        /*
         * Scan for the screenshot exception
         */
        Throwable previous, next = problem;
        do {
            if( next instanceof ScreenshotException ){
                recordScreenshot((ScreenshotException)next);
            }
            previous = next;
            next = previous.getCause();
        } while(previous != next && next != null);
    }
    
    private void recordScreenshot(ScreenshotException information){
        String fileName = "screenshot-"+ System.currentTimeMillis()+".png";
        System.out.println("Capturing screenshot to "+fileName);
        String base64 = information.getBase64EncodedScreenshot();
        byte pngData[] = OutputType.BYTES.convertFromBase64Png(base64);
        try {
            FileOutputStream output = new FileOutputStream(fileName, false);
            output.write(pngData);
            output.close();
        } catch (IOException ioe) {
            throw new IllegalStateException("Unable to write screenshot", ioe);
        }        
    }

    private WebDriver buildDriver(final String webDriverHost) throws MalformedURLException {
        DesiredCapabilities capabilities = DesiredCapabilities.phantomjs();
        URL hostURL = new URL(webDriverHost);
        RemoteWebDriver driver = new RemoteWebDriver(hostURL, capabilities);
        driver.getErrorHandler().setIncludeServerErrors(true);
        driver.setLogLevel(Level.ALL);
        
        return driver;
    }
}
