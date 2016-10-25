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
    'budgetline',
    'fmsnumber',
    'title',
    'totalestimatedcost',
    'totalappropriation31may16',
    'appropriationavailable31may16',
    'adoptedfy17capitalbudget',
    'fy18',
    'fy19',
    'fy20',
    'requiredtocomplete',
    'mando',
    'estimateddateofcompletion'
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

  for (var i=12; i<14; i=i+2) {

    var firstPageText = pages[i-1];
    var secondPageText = pages[i];

    //parse first page
    var firstPageBudgetLines=firstPageText.split('------------------------------------------------------------------------------------------------------------------------------------')
    var secondPageBudgetLines=secondPageText.split('------------------------------------------------------------------------------------------------------------------------------------')
    


    // //get rid of first 10 lines and last 6 lines
    firstPageBudgetLines.splice(0,3)
    firstPageBudgetLines.splice(firstPageBudgetLines.length-1,1)

    secondPageBudgetLines.splice(0,3)
    secondPageBudgetLines.splice(secondPageBudgetLines.length-1,1)


    firstPageBudgetLines.map(function(budgetLine, i) {
      var textLines = budgetLine.split('\n')
      textLines.splice(0,1)

      var lineDescription = '';

      textLines.map(function(line, j) {
        lineDescription += line.substring(11,65).trim() + ' '
      })

      var data = {
        budgetLine: textLines[0].substring(0,10).trim(),
        fmsNumber: textLines[1].substring(0,10).trim(),
        description: lineDescription.trim()
      }


      var secondPageTextLines = secondPageBudgetLines[i].split('\n')
      secondPageTextLines.splice(0,1)
      
      secondPageTextLines.map(function(line) {
        var values = line.split(/\s+/)
        
        console.log(values.length)
        //first line with full data
        if(values.length==8) {
          parseAmounts(values, 1, data)
          data.mo = values[6],
          data.edc = values[7]
        } 

        
      })
      

      console.log(data)
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
  var match = value.match(/(.*)\((.*)\)/)

  return {
    key: key + match[2],
    amount: parseFloat(match[1].replace(/,/g, ''))
  }
}




// //scrape the table
// function scrape(tableText) {

//   //split on new lines
//   var rows = tableText.split('\n');

//   //for each row, process and write to output
//   rows.forEach( function(row) {
//     console.log(row);
//     //check if row has no length or starts with a space
//     if (row.length > 0 && row.substring(0,1) != ' ') { 

//       //split on more than one white space
//       var split = row.split(/\s{2,}/);

//       //prepend and append double quotes for each column so that they are valid CSV strings
//       split.forEach( function(item, j ) {
//         split[j] = '"' + item + '"';
//       });

//       //join together with commas, add a new line character
//       var csvLine = split.join(',') + '\n'

//       //console.log(csvLine);    
//       output.write(csvLine); //write the row
//     }
//   })
// }