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
    var firstPageLines=firstPageText.split('------------------------------------------------------------------------------------------------------------------------------------')
    var secondPageLines=secondPageText.split('------------------------------------------------------------------------------------------------------------------------------------')
    


    // //get rid of first 10 lines and last 6 lines
    firstPageLines.splice(0,3)
    firstPageLines.splice(firstPageLines.length-1,1)

    secondPageLines.splice(0,3)
    secondPageLines.splice(secondPageLines.length-1,1)
    console.log(firstPageLines.length, secondPageLines.length)


    firstPageLines.map(function(budgetLine) {
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

      console.log(data)
    })

    // var isSecondLine = false

    // console.log(firstPageLines)
    // console.log(secondPageLines)

    // firstPageLines.map(function(line, j) {
    //   //console.log(line)

    //   if(line.substring(0,3) != '---') {  
    //     var newBudgetLine = line.match(/^[A-Z]{1,2}-\S*\s{2}/g)
      
    //     if(isSecondLine) {
    //       currentBudgetLine.fmsNumber = line.substring(0,10).trim()
    //       isSecondLine = false
    //     }

    //     if (newBudgetLine != null) {
    //       isSecondLine = true

    //       currentBudgetLine.budgetLine = newBudgetLine[0].trim() 
    //     }

    //     console.log(secondPageLines[j])

    //     //parse adoptedBudget from associated 2nd page line
    //     var adoptedBudget = secondPageLines[j].substring(10,20).trim()
    //     currentBudgetLine.adoptedBudget.push(adoptedBudget)
        
  
    //     var lineDescription = line.substring(11,65)
    //     currentBudgetLine.description += lineDescription.trim() + ' '
    //   } else {

    //     budgetLines.push(currentBudgetLine)

    //     currentBudgetLine = {
    //       description: '',
    //       adoptedBudget: []
    //     }
    //   }
    // })


    // console.log(budgetLines)

  }
})


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