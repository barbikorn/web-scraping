import requests
from bs4 import BeautifulSoup

url = "https://www.home.co.th/home/i/10626-%E0%B8%AE%E0%B8%B2%E0%B8%9A%E0%B8%B4%E0%B9%80%E0%B8%97%E0%B8%B5%E0%B8%A2-%E0%B8%A2%E0%B8%B2%E0%B8%A3%E0%B9%8C%E0%B8%94-%E0%B8%A3%E0%B8%B2%E0%B8%A1%E0%B8%AD%E0%B8%B4%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B8%B2"

page = requests.get( url )
dom = dom = BeautifulSoup( page.content, 'lxml')

info = dom.find( class_='info-left')
rows = info.find_all( 'li')
f = open( 'temp.txt' , 'w' , encoding='utf-8')
for row in rows :
    if row.find( 'span') :
        label = row.find( 'span').getText().strip()
        value = row.find( 'p').getText().strip()
        print( "%s : %s" % ( label , value ))
        f.write( "%s : %s\n" % ( label , value ))

f.close()