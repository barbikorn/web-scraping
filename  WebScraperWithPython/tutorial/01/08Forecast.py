import requests
from bs4 import BeautifulSoup

url = "http://forecast.weather.gov/MapClick.php?lat=37.7772&lon=-122.4168"
page = requests.get( url )
soup = BeautifulSoup(page.content, 'html.parser')

seven_day = soup.find(id="seven-day-forecast")
#forecast_items = seven_day.find_all(class_="tombstone-container")
#tonight = forecast_items[0]

#print(tonight.prettify())

# period = tonight.find(class_="period-name").get_text()
# short_desc = tonight.find(class_="short-desc").get_text()
# temp = tonight.find(class_="temp").get_text()

# print(period)
# print(short_desc)
# print(temp)

# img = tonight.find("img")
# desc = img['title']

# print(desc)


short_descs = [sd.get_text() for sd in seven_day.select(".tombstone-container .short-desc")]
temps = [ int( t.get_text().split( ' ')[1] ) for t in seven_day.select(".tombstone-container .temp")]
descs = [d["title"] for d in seven_day.select(".tombstone-container img")]

print(short_descs)
print(temps)
print(descs)


