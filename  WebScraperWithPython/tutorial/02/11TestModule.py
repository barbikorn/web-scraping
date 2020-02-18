import lib.ParseTable

url = "http://www.hubertiming.com/results/2017GPTR10K"
tableId = 'individualResults'
outputFile = 'runner.csv'

parseTable = lib.ParseTable.ParseTable(   )
parseTable.setUrl( url , tableId , outputFile )
