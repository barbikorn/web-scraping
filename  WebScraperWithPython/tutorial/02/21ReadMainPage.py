from bs4 import BeautifulSoup
import requests

url = "http://www.hubertiming.com/"
page = requests.get( url )


soup = BeautifulSoup(page.content, 'html.parser')
print(soup.prettify())