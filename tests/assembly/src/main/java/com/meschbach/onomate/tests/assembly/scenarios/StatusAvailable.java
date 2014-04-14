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

import java.net.MalformedURLException;
import java.net.URL;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 *
 * @author meschbach
 * @version 0.0.1
 * @since 0.0.1
 */
public class StatusAvailable {

    private final WebDriver driver;
    private final String deployedURL;

    public StatusAvailable(WebDriver driver, String deployedURL) {
        this.driver = driver;
        this.deployedURL = deployedURL;
    }

    private void gotoStatusPage() {
        driver.get(deployedURL+"/status");
    }

    public void systemRunning() {
        gotoStatusPage();
        String text = waitOnTextOf(By.id("system-status"));
        assert text.equals("Running");
    }
    
    private String waitOnTextOf(By selector){
        WebDriverWait wait = new WebDriverWait(driver,2);
        wait.until(ExpectedConditions.presenceOfElementLocated(selector));

        WebElement element = driver.findElement(selector);
        return element.getText();
    }

    public static void main(String arguments[]) {
        final String deployedURL = "http://localhost:9000";
        final String webDriverHost = "http://127.0.0.1:9515";
        try {
            WebDriver driver = buildDriver(webDriverHost);
            try {
                StatusAvailable statusScenarios = new StatusAvailable(driver, deployedURL);
                statusScenarios.systemRunning();
            }finally{
                driver.quit();
            }
        }catch(Throwable t){
            t.printStackTrace();
        }
    }
    
    private static WebDriver buildDriver(final String webDriverHost) throws MalformedURLException{
        DesiredCapabilities capabilities = DesiredCapabilities.chrome();
        URL hostURL = new URL(webDriverHost);
        WebDriver driver = new RemoteWebDriver(hostURL, capabilities);
        return driver;
    }
}
