#captial-budget-scrape

A node.js scraper for the NYC capital budget

##Get the Data
Download the output csv [here](https://github.com/chriswhong/capital-budget-scrape/blob/master/data/fy17capitalbudget.csv)

##What does it do?

It pulls a bare minimum of information from the [FY17 capital budget pdf](http://www1.nyc.gov/assets/omb/downloads/pdf/cb6-16.pdf).

Specifically, it is grabbing data from the "geographic analysis" in the back of the pdf:

`boro` - The geography, either one of the five boroughs or "citywide"
`budgetline` - the project type plus a code, this is also the unique id
`type` - the project's type, which is a one or two character code.  Find the codes on page 4 fo the budget pdf, and see what agencies they align with.  Some agencies have multiple codes
`description` - the description of the project - this is truncated from the full descriptions that appear earlier in the pdf, but are good enough to understand what the project is about without being too verbose

Funding Fields: `fy17cn`,`fy17cx`,`fy17f`,`fy17s`,`fy17p`,`fy17total`

CN - City Non-exempt
CX - City Exempt
F - Federal
S - State
P - Private
Total - Sum of all of these

##Total 
The sum of the `fy17total` column should be `14007015000` ($14B)
You will find a similar number in the totals on page 8 of the PDF.  It is slightly different because the budget lines listed in the gepgraphic analysis are in thousands of dollars, while the budget lines in the earlier sections are accurate to one dollar.  

##Run the scraper locally yourself

```
$ npm install
$ node scrape.js

```
