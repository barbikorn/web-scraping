import requests
from bs4 import BeautifulSoup

url = "http://forecast.weather.gov/MapClick.php?lat=37.7772&lon=-122.4168"
page = requests.get( url )
soup = BeautifulSoup(page.content, 'html.parser')

seven_day = soup.find(id="seven-day-forecast")
forecast_items = seven_day.find_all(class_="tombstone-container")
tonight = forecast_items[0]
print(tonight.prettify())
