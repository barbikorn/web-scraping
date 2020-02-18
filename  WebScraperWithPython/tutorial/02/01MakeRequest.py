from bs4 import BeautifulSoup
import requests

url = "http://www.hubertiming.com/results/2017GPTR10K"
page = requests.get( url )


soup = BeautifulSoup(page.content, 'html.parser')
print(soup.prettify())