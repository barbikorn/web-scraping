from bs4 import BeautifulSoup
import requests

url = "http://dataquestio.github.io/web-scraping-pages/simple.html"
page = requests.get( url )
#print( page )

soup = BeautifulSoup(page.content, 'html.parser')
#print(soup.prettify())

pTags = soup.find_all( 'p' )
for pTag in pTags :
    print( pTag.getText() )