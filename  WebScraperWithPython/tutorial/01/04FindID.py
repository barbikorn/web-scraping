import requests
from bs4 import BeautifulSoup

url = "http://dataquestio.github.io/web-scraping-pages/ids_and_classes.html"
page = requests.get( url )

soup = BeautifulSoup(page.content, 'html.parser')
#print( soup )

#tag = soup.find( {  'id' : 'first'})

tag = soup.find( id='first')
print( tag.getText().strip() )