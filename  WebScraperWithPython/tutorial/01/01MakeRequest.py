import requests

url = "http://dataquestio.github.io/web-scraping-pages/simple.html"
page = requests.get( url )
print( page )

print( page.content )