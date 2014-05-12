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

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 *
 * @author Mark Eschbach <meschbach@gmail.com>
 * @version 0.0.1
 * @since 0.0.2
 */
public class OnomateAssembly {

    private final WebDriver driver;
    private final String deployBase;

    public OnomateAssembly(WebDriver driver, String deployBase) {
        this.driver = driver;
        this.deployBase = deployBase;
    }

    public StatusResource gotoStatus() {
        driver.get(deployBase + "/status");
        return new StatusResource();
    }

    public class StatusResource {

        public String status() {
            String text = waitOnTextOf(By.id("system-status"));
            return text;
        }
    }

    private void waitOn(By selector) {
        try {
            WebDriverWait wait = new WebDriverWait(driver, 2);
            wait.until(ExpectedConditions.presenceOfElementLocated(selector));
        } catch (TimeoutException te) {
            throw new WaitTimeoutException("Unable to locate " + selector.toString(), te);
        }
    }

    private String waitOnTextOf(By selector) {
        waitOn(selector);

        WebElement element = driver.findElement(selector);
        return element.getText();
    }

    public Landing gotoLanding() {
        driver.get(deployBase);
        return new Landing();
    }

    public class Landing {

        public Dashboard authenticate() {
            By entryLocator = By.linkText("Enter");
            waitOn(entryLocator);

            WebElement element = driver.findElement(entryLocator);
            element.click();

            return new Dashboard();
        }
    }

    public class Dashboard {

        public Dashboard newAuthority(String authorityName, String nameServer, String contactEmail) {
            final By soaContainerSelector = By.id("new-zone");

            waitOn(soaContainerSelector);
            WebElement container = driver.findElement(soaContainerSelector);
            container.findElement(By.xpath(".//input[@ng-model = 'fqdn']")).sendKeys(authorityName);
            container.findElement(By.xpath(".//input[@ng-model = 'nameServer']")).sendKeys(nameServer);
            container.findElement(By.xpath(".//input[@ng-model= 'administrator']")).sendKeys(contactEmail);
            container.findElement(By.tagName("button")).click();
            return this;
        }

        public Authority authorityByZone( final String zone ) {
            final By selector = By.xpath("//div[ @id = 'zones']/descendant::tr[td[text()='"+zone+"']]");
            waitOnTextOf(selector);
            WebElement container = driver.findElement(selector);
            return new RowZoneAuthority(container);
        }
    }

    public interface Authority {
        public String zone() ;
        public String nameServer() ;
        public String administrator();
        public Authority waitOnPersisted();
        public Zone details();
    }
    
    public class RowZoneAuthority implements Authority{
        final WebElement container;

        public RowZoneAuthority(WebElement container) {
            this.container = container;
        }

        public String zone() {
            return container.findElements(By.tagName("td")).get(0).getText();
        }

        public String nameServer() {
            return container.findElements(By.tagName("td")).get(1).getText();
        }

        public String administrator() {
            return container.findElements(By.tagName("td")).get(2).getText();
        }

        public Authority waitOnPersisted(){
            waitOn(By.xpath("./descendant::td[text() = 'Persisted']"));
            return this;
        }
        
        public Zone details(){
            container.findElement(By.linkText("Details")).click();
            waitOn(By.id("resource-records"));
            return new Zone();
        }
    }
    
    public enum RecordType {
        A,
        NS,
        CNAME
    }

    public class Zone {
        public Zone createRecord( final String name, final RecordType type, final String data ){
            WebElement wizard = driver.findElement(By.id("rr-wizard"));
            wizard.findElement(By.className("rr-host")).sendKeys(name);
            WebElement typeElement = wizard.findElement(By.className("rr-type"));
            Select typeSelector = new Select(typeElement);
            typeSelector.selectByVisibleText(type.name());

            wizard.findElement(By.className("rr-data")).sendKeys(data);
            wizard.findElement(By.name("create-rr")).click();
            return this;
        }
        
        public ResourceRow getResource( final String name ){
            String xpath = "//table[@id='resource-records']/descendant::tr[ td[contains(@class, 'rr-host') and text() = '"+name+"'] ]";
            WebElement resourceRow = driver.findElement(By.xpath(xpath));
            return new  ResourceRow(resourceRow);
        }
    }
    
    public class ResourceRow {
        WebElement row;

        public ResourceRow(WebElement row) {
            this.row = row;
        }
        
        public String host(){
            return row.findElement(By.className("rr-host")).getText();
        }
        
        public String type(){
            return row.findElement(By.className("rr-type")).getText();
        }

        public String value(){
            return row.findElement(By.className("rr-data")).getText();
        }
    }
    
    static class WaitTimeoutException extends RuntimeException {

        public WaitTimeoutException(String message) {
            super(message);
        }

        public WaitTimeoutException(String message, Throwable cause) {
            super(message, cause);
        }

        public WaitTimeoutException(Throwable cause) {
            super(cause);
        }
    }
}
