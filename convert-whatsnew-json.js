#!/usr/bin/env node
var fs = require('fs');
var jsonfile = require('jsonfile')
var csv = require('csvtojson');
var csvField = require('./data/mappingTable.js');
var newEvent = require('./data/newEvent.js').newEvent;

var argv = require('yargs')
	.option('p', {
		alias : 'path',
		demand: true,
		describe: 'Please assign a CSV path.',
		type: 'string'
	})
	.argv
;

var filePath = argv.p;
const outputPath = './NEWS/';

fs.readdir(filePath, (err, files) => {
	files.forEach(parser);
});

function parser(fileName){
	if(fileName.indexOf('model') === -1) return true;

	var eventName = fileName.replace('.model.csv', '');
	var modelCsvPath = filePath + eventName + '.model.csv';
	var contentCsvPath = filePath + eventName + '.content.csv';

	csv()
		.fromFile(modelCsvPath)
		.on('json', (thisModel) => {
			var supportVersion = thisModel['Support FW version'];
			if(supportVersion == "") return true;

			var outputFile = outputPath + thisModel['Model Name'] + "_NEWS.json";

			var thisEvent = new newEvent();
			thisEvent.webUrl = (thisModel['Web URL'].length == 0) ? "NOTSUPPORT" : thisModel['Web URL'];
			thisEvent.appUrl = (thisModel['App URL'].length == 0) ? "NOTSUPPORT" : thisModel['App URL'];

			fs.readFile(outputFile, 'utf8', (err, cachedData) => {
				var outputData = {};

				try{
					var outputData = JSON.parse(cachedData);
					var isDuplicate = false;

					outputData[supportVersion].forEach((existingEvent) => {
						if(
							existingEvent.webUrl == thisEvent.webUrl &&
							existingEvent.appUrl == thisEvent.appUrl
						){
							isDuplicate = true;
						}
					})

					if(isDuplicate) return true;
				}
				catch(e){
					outputData[supportVersion] = new Array;
				}

				csv()
					.fromFile(contentCsvPath)
					.on('json', (content) => {
						for(var lang in csvField.lang){
							thisEvent[csvField.content[content.field1]][lang] = content[csvField.lang[lang]];
						}

						outputData[supportVersion].push(thisEvent);
					})
					.on('done', () => {
						jsonfile.writeFileSync(outputFile, outputData, {spaces: 4, EOL: '\r\n'}, function(){})
					})
				})
		})
		.on('done', () => {
			// run tester
		})
}