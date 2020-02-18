import re
import urllib.request

url = 'http://example.webscraping.com/places/default/view/India-102'
response = urllib.request.urlopen( url )
html = response.read()
text = html.decode()

print( text )

