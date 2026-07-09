import requests

def get_lat_lon(venue_address):
    url = "https://nominatim.openstreetmap.org/search"
    headers = {'User-Agent': 'TicketingSystemApp/1.0'}
    params = {
        'q': venue_address,
        'format': 'json',
        'limit': 1
    }
    
    try:
        response = requests.get(url, params=params, headers=headers).json()
        if response:
            return float(response[0]['lat']), float(response[0]['lon'])
    except Exception as e:
        print(f"Error fetching coordinates: {e}")
    return None, None