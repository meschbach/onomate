/*
 * Copyright 2019 Mark Eschbach
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
//Testing framework
const {expect} = require("chai");

//Utilities
const Future = require("junk-bucket/future");

class MockResponse {
	constructor() {
		this.endingFuture = new Future();
		this.ended = this.endingFuture.promised;
	}

	writeHead( status, statusText, entity ) {
		this.head ={
			status, statusText
		};
		this.body = entity;
	}

	end(){
		this.endingFuture.accept();
	}
}


//SUT
const {WebFacet} = require("../../web-application");

describe('WebFacet', function () {
	describe("#createAuthority",function () {
		describe("Given an empty request body", function () {
			it("is invalid", async function () {
				const mockResponse = new MockResponse();

				const facet = new WebFacet({});
				facet.createAuthority({body:{}}, mockResponse);
				await mockResponse.ended;
				expect( mockResponse.head ).to.deep.eq({status: 422, statusText: 'Unprocessable Entity'});
			})
		});
	});
});
