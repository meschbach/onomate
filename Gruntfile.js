/*
 * Copyright 2015 Mark Eschbach
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

module.exports = function( grunt ){
	var config = {
		pkg: grunt.file.readJSON('package.json'),
		bower: { install: { options: { copy: false, verbose: true } } },
		concat : {
			libjs: {
				src: [
					"bower_components/angular/angular.js",
					"bower_components/angular-resource/angular-resource.js",
					"bower_components/angular-route/angular-route.js",
					'bower_components/jquery/dist/jquery.js',
					'bower_components/bootstrap/dist/js/bootstrap.js'
				],
				dest: "browser/libs.js"
			},
			libcss: {
				src: [
					"bower_components/bootstrap/dist/css/bootstrap.css"
				],
				dest: "browser/libs.css"
			}
		},
		copy: {
			fonts: {
				files: [
					{expand: true, cwd: 'bower_components/bootstrap/dist', src: ['fonts/*'], dest: "browser"}
				]
			}
		},
		migrate: {
			options: {
				verbose: true
			}
		},
		uglify: {}
	};

	grunt.initConfig( config );
	grunt.loadNpmTasks( "grunt-contrib-concat" );
	grunt.loadNpmTasks( "grunt-contrib-uglify" );
	grunt.loadNpmTasks( "grunt-bower-task" );
	grunt.loadNpmTasks( "grunt-db-migrate" );
	grunt.loadNpmTasks( "grunt-contrib-copy" );

	grunt.registerTask( "setup", ["bower:install", "migrate:up" ] );

	grunt.registerTask( "build-libs", [ "concat:libjs", "concat:libcss", "copy:fonts" ] );

	grunt.registerTask( "default", [] );
}
