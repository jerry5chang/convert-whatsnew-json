#!/usr/bin/env node
var fs = require('fs');
var jsonfile = require('jsonfile')
var csv = require('csvtojson');

const outputPath = './whatsnew_data/';
const csvModelFilePath = './csv/whatsnew-model.csv';
const csvEventFilePath = './csv/whatsnew-event.csv';
const LangTable = require('./data/FieldMappingTable.js').languageTable;
const EventFields = require('./data/FieldMappingTable.js').eventFields;

function newEvent(){
    this.eventId = new Date().getTime().toString();
    this.webUrl = "";
    this.appUrl = "";
    this.title = {};
    this.desc = {};
}

csv()
	.fromFile(csvModelFilePath)
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
				.fromFile(csvEventFilePath)
				.on('json', (event) => {
					for(var lang in LangTable){
						thisEvent[EventFields[event.field1]][lang] = event[LangTable[lang]];
					}
				})
				.on('done', () => {
					outputData[supportVersion].push(thisEvent);
					jsonfile.writeFile(outputFile, outputData, {spaces: 4, EOL: '\r\n'}, function(){})
				})
			})
	})
	.on('done', () => {
		// run tester
	})