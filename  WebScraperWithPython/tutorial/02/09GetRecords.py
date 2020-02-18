from bs4 import BeautifulSoup
import requests
import csv


url = "http://www.hubertiming.com/results/2017GPTR10K"
page = requests.get( url )


soup = BeautifulSoup(page.content, 'html.parser')
# print(soup.prettify())


#title = soup.title.getText()
#print( title )


table = soup.find( id='individualResults')
#print(table)

ths = table.find_all( 'th')
# headers = []
# for th in ths :
#     headers.append( th.getText() )
# print( headers )

headers = [ th.getText() for th in ths ]
# print( headers )

rows = table.find_all( "tr")
records = []
# row 0 => header
# row 1 => start data
for i in range( 1 ,  len( rows)) :
     row = rows[i]
     tds = row.find_all('td')
     record = [ td.getText() for td in tds ]
    #  record = []
    #  for td in tds :
    #      record.append( td.getText() )
     records.append( record )
