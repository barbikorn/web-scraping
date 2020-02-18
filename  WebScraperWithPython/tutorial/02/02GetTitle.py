from bs4 import BeautifulSoup
import requests

#http://www.hubertiming.com/results/2017GPTR10K
url = "http://www.hubertiming.com/results/2017GPTR10K"
page = requests.get( url )


soup = BeautifulSoup(page.content, 'html.parser')
# print(soup.prettify())


title = soup.title.getText()
print( title )


# rows = soup.find_all('tr')
# print(rows[0])