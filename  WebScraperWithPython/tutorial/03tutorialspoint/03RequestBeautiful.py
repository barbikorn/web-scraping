import requests
from bs4 import BeautifulSoup

url = 'https://authoraditiagarwal.com/'
response  = requests.get( url )

soup = BeautifulSoup( response.text, 'lxml')
print (soup.title)
print (soup.title.text)