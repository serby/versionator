fs = require 'fs'
exec = (command, callback) ->
	console.log 'Excecuting \'' + command + '\''
	require('child_process').exec command, callback

option '-f', '--file [FILE]', 'Use file in task'

task 'delintAll', 'Runs jshint on all js code', (options) ->

	paths = 'lib test'
	if options.file
		paths = options.file

	exec 'jshint ' + paths, execOutput

task 'delint', 'Runs all modified or added files through jshint', (options) ->
	exec 'jshint `git status --porcelain | sed -e "s/^...//g"`', execOutput

task 'test', 'Runs all unit tests', (options) ->
	exec 'node_modules/mocha/bin/mocha -r should -R List ', execOutput

task 'npm-publish', 'Creates a tag based on version number in package.json then pushes and publishes to NPM', (options) ->
	version = JSON.parse(fs.readFileSync('./package.json')).version
	log 'Publishing ' + version
	exec 'git tag ' + version, execOutput
	exec 'git push --tags', execOutput
	exec 'npm publish', execOutput

execOutput = (error, stout, sterr) ->
	if sterr
		console.warn sterr
	if stout
		console.log stout

log = console.log
