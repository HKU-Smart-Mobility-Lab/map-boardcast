
import requests
import json
import polyline

# Your Mapbox access token
mapbox_access_token = "pk.eyJ1IjoibWF0dGp3YW5nIiwiYSI6ImNsaXB5NDN1cTAzMnAza28xaG54ZWRrMzgifQ.cUju1vqjuW7XmAuO2iEZmg";


start = [114.2119, 22.2828] 
end = [114.1467, 22.2436] 

url = f"https://api.mapbox.com/directions/v5/mapbox/driving/{start[0]},{start[1]};{end[0]},{end[1]}?access_token={mapbox_access_token}"

response = requests.get(url).json()

for route in response['routes']:
    coordinates = polyline.decode(route['geometry'])
    coordinates = [[coord[1], coord[0]] for coord in coordinates]
    print(coordinates)