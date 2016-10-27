
var URL_CSV = 'https://raw.githubusercontent.com/loisaidasam/capital-budget-scrape/master/data/fy17capitalbudget.csv'


/**
  * Choose non-empty row
  */
function chooseRow(rows) {
    while (true) {
        var index = Math.floor(Math.random() * rows.length);
        // console.log("Using index " + index);
        var row = rows[index];
        var cost = parseInt(row['fy17total']);
        if (cost) {
            return row;
        }
    }
}


/**
 * via http://stackoverflow.com/a/14428340/1406873
 */
function formatCost(cost) {
    return cost.replace(/./g, function(c, i, a) {
        return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
    });
}


function processData(data) {
    // Header row:
    // boro,budgetline,type,description,fy17cn,fy17cx,fy17f,fy17s,fy17p,fy17total
    var rows = $.csv.toObjects(data);
    // console.log("CSV had " + rows.length + " rows");
    var row = chooseRow(rows);
    // console.log(row);
    $('#item').text(row['description']);
    var cost = "$" + formatCost(row['fy17total']);
    $('#total_cost').text(cost);
}

function download_data() {
    // console.log("Downloading from " + URL_CSV);
    $.ajax({
        type: "GET",
        url: URL_CSV,
        dataType: "text",
        success: function(data) {
            processData(data);
        }
     });
}

$(document).ready(download_data());
