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

headers = [ th.getText() for th in ths ]
print( headers )