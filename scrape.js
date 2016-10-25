//scrape.js - scrapes the NYC FY2017 Capital Budget
//Include source pdf and output filename as 1st and 2nd arguments like:
//node scrape .pdf/input.pdf ./data/fy17capitalbudget.csv

//dependencies
var extract = require('pdf-text-extract'),
fs = require('fs');

var config = {
  inputPath: process.argv[2],
  outputPath: process.argv[3],
  headers: [
    'boro',
    'budgetline',
    'type',
    'description',
    'fy17cn',
    'fy17cx',
    'fy17f',
    'fy17s',
    'fy17p',
    'fy17total'
  ]  
}

//create output file and write the header row
var outputFile = fs.createWriteStream(config.outputPath)
outputFile.write(config.headers.join(',') + '\n')

//extract is calling pdftotext, returning an array of pages of text
extract(config.inputPath, {}, function (err, pages) {
  console.log('Pulled ' + pages.length + ' pages of text from ' + config.inputPath)

  var budgetLines = []

  var currentBudgetLine = {
    description: '',
    adoptedBudget: []
  }

  //create array to match the geography lines of the geographic report
  var boroLines = [
    'C I T Y W I D E',
    'B R O N X',
    'B R O O K L Y N',
    'M A N H A T T A N',
    'Q U E E N S',
    'R I C H M O N D'
  ]

  var boroText = [
    'citywide',
    'bronx',
    'brooklyn',
    'manhattan',
    'queens',
    'richmond'
  ]

  var boro,
  rowData = null,
  budgetLine

  //pp422-542 are the geographic analysis, which includes the 2017 budget amounts we are interested in
  for (var i=422; i<542; i++) {

    var firstPageText = pages[i-1];
    var lines = firstPageText.split('\n')
    console.log(lines)
    lines.map(function(line) {

      //check if the line contains text for one of the geographies, if so, set geography (boro)
      if(boroLines.indexOf(line) > -1) {
        boro=boroText[boroLines.indexOf(line)]
      }

      //if this is a line separator, we should probably write the row to the output
      if(line.match('------------------------------------------------------------------------------------------------------------------------------------')) {
        console.log(rowData)
        if(rowData) writeRow(rowData)
        rowData = null
      }

      //check for budget line code at the beginning of the line
      var newBudgetLine = line.match(/^[A-Z]{1,2}-\S*\s{2}/g)
      if(newBudgetLine) {
        rowData = {
          boro: boro,
          budgetLine: newBudgetLine[0].trim(),
          type: newBudgetLine[0].trim().split('-')[0],
          description: ''
        }
      }  

      //if rowData isn't null, grab the rest of the goodies
      if(rowData) {
        //grab the description
        rowData.description += line.substring(11,54).trim() + ' '

        //regex to find 2017 amounts, and only the 2017 amounts
        var matchAmount = line.substring(69, 133).match(/\d{1,3}(,\d{3})*(\.\d+)?\s*\(([A-Z]*)\)/)
        
        //clean up numbers and append the appropriate key in the output object.  1,000 (CN) should end up being fy17cn: 1000
        if(matchAmount) {
          var fy17 = parseValue('fy17', matchAmount[0].trim())
          rowData[fy17.key] = fy17.amount
        }
      }
    })
  }
})

//given a base key (fy17) and a parsed value from the pdf ('10,050 (CX)'), return an object with a more descriptive key and cleaned $ amount 
function parseValue(key, value) {
  console.log(value)
  var match = value.match(/(.*)\((.*)\)/)
  if(match) {
    return {
      key: key + match[2],
      amount: parseFloat(match[1].replace(/,/g, '') * 1000)
    }    
  }
}

//take the rowData object and write it to a new line in the csv
function writeRow(rowData) {
  
  var dollarFields = ['fy17CN', 'fy17CX', 'fy17F', 'fy17S', 'fy17P']

  var total = 0
  dollarFields.map(function(field) {
    if(typeof(rowData[field]) == 'number') total += rowData[field]
  })
  

  var rowDataArray = [
    rowData.boro,
    rowData.budgetLine,
    rowData.type,
    '\"' + rowData.description.trim() + '\"',
    rowData.fy17CN,
    rowData.fy17CX,
    rowData.fy17F,
    rowData.fy17S,
    rowData.fy17P,
    total
  ]
  
  outputFile.write(rowDataArray.join(',') + '\n')
}

//IMPORTANT!  MANUAL CHANGE TO OUTPUT FILE REQUIRED UNTIL WE CAN FIX THIS:

//Budget Line E-2364 is not formatted the same as the others!!!
//The regex for finding comma-delimited numbers only grabs its last 3 digits,  
//this throws the number off by 2 billion dollars, as it is the largest capital budget line!  
