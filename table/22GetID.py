from bs4 import BeautifulSoup
import requests
import lib.ParseTable


url = "http://www.hubertiming.com/"
tableId = 'individualResults'
page = requests.get( url )


soup = BeautifulSoup(page.content, 'html.parser')
#print(soup.prettify())

div = soup.find( id = 'tabs-2')
anchors = div.find_all( 'a', href=True ) 

urls = [ anchor[ 'href' ] for anchor in anchors ]

parseTable = lib.ParseTable.ParseTable()
# for i in range( 0,5) :
#     url = urls[i]
#     parseTable.setUrl( url , tableId )

for url in urls : 
    parseTable.setUrl( url , tableId )


#print( urls ) 


