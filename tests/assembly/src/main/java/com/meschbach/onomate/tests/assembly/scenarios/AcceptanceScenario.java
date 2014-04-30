/*
 * Copyright 2014 gremlin.
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

import org.openqa.selenium.WebDriver;

/**
 * Abstraction of an AcceptanceScenario requiring a WebDriver and the applications deployed location.
 * 
 * @author Mark Eschbach <meschbach@gmail.com>
 * @since 0.0.2
 * @version 0.0.1
 */
public interface AcceptanceScenario {
    public void run(WebDriver driver, String deployedURL ) throws Exception ;
}