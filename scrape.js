//Scrapes Published OMB Budget Documents
//Include source pdf and output filename as arguments like:
//node scrape input.pdf ./output.csv

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



var outputFile = fs.createWriteStream(config.outputPath)


//write the headers to the output csv first
outputFile.write(config.headers.join(',') + '\n')

//extract gives an array of stings, each string contains the text of a full page
//we are passing an empty options object AND a path to the pdftotext executable
//so that we don't have to edit PATH in windows (which we don't have rights to do)
extract(config.inputPath, {}, function (err, pages) {
  console.log('Pulled ' + pages.length + ' pages of text from ' + config.inputPath)
  //we only want 12 thru 399 
  // for (var i=12; i<399; i++) {

  var budgetLines = []

  var currentBudgetLine = {
    description: '',
    adoptedBudget: []
  }

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

  for (var i=422; i<542; i++) {

    var firstPageText = pages[i-1];
    var lines = firstPageText.split('\n')
    console.log(lines)
    lines.map(function(line) {
      if(boroLines.indexOf(line) > -1) {
        boro=boroText[boroLines.indexOf(line)]
      }

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



      if(rowData) {
        //grab the description
        rowData.description += line.substring(11,54).trim() + ' '

        //regex to find amounts

        var matchAmount = line.substring(69, 133).match(/\d{1,3}(,\d{3})*(\.\d+)?\s*\(([A-Z]*)\)/)
        

        if(matchAmount) {
          var fy17 = parseValue('fy17', matchAmount[0].trim())
          rowData[fy17.key] = fy17.amount
        }
       
      }

    })
  }
})


//grabs fy17, 18, 19, 20 from source array starting at position i
function parseAmounts(source, index, data) {
  var yearKeys = ['fy17', 'fy18', 'fy19', 'fy20', 'rc']
  for(var i=0; i<5; i++) {
    var value = parseValue(yearKeys[i], source[i+index])
    data[value.key] = value.amount
  }
}


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

//Budget Line E-2364 is not formatted the same as the others!!!
//The regex for finding comma-delimited numbers only grabs its last 3 digits,  
//this throws the number off by 2 billion dollars, as it is the largest capital budget line!  
