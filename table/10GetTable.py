from bs4 import BeautifulSoup
import requests
import csv


url = "http://www.hubertiming.com/results/2017GPTR10K"
url = 'http://www.teamredlizard.com/xc/2013XC5'
page = requests.get( url )


soup = BeautifulSoup(page.content, 'html.parser')
# print(soup.prettify())


#title = soup.title.getText()
#print( title )


table = soup.find( id='individualResults')
#print(table)

rows = table.find_all( "tr")
ths = table.find_all( 'th')

headers = [ th.getText() for th in ths ]
print( headers )
records = []
for i in range( 1 ,  len( rows)) :
     row = rows[i]
     tds = row.find_all('td')
     record = [ td.getText() for td in tds ]
     records.append( record ) 


# part write csv file 
outputFile = 'runner.csv'
file = open( outputFile , 'w' )
writer = csv.writer( file )
# write header
writer.writerow( headers)
# write all records
writer.writerows( records )
file.close()