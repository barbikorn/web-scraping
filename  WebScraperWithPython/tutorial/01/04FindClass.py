import requests
from bs4 import BeautifulSoup

url = "http://dataquestio.github.io/web-scraping-pages/ids_and_classes.html"
page = requests.get( url )

soup = BeautifulSoup(page.content, 'html.parser')
#print( soup )

#tags = soup.find_all('p', class_='outer-text')
tags = soup.find_all('p', {  'class' : 'outer-text'})
for tag in tags :
    print( tag.getText().strip() )