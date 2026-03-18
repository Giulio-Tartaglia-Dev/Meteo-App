#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Weather Dress Advisor
A script that fetches weather data for a city and suggests appropriate clothing.
"""

import requests
import sys
import json
import os

# Set console encoding for Windows
if sys.platform == 'win32':
    os.system('chcp 65001 >nul')

def get_weather_data(api_key, city):
    """
    Fetch weather forecast data from WeatherAPI.com for a given city.
    
    Args:
        api_key (str): WeatherAPI.com API key
        city (str): City name to fetch weather for
        
    Returns:
        dict: Weather forecast data from the API
        None: If the request fails
    """
    base_url = "http://api.weatherapi.com/v1/forecast.json"
    params = {
        'key': api_key,
        'q': city,
        'days': 5,
        'aqi': 'no',
        'alerts': 'no'
    }
    
    try:
        response = requests.get(base_url, params=params, timeout=10)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        return response.json()
        
    except requests.exceptions.RequestException as e:
        print(f"Error making request to weather API: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response: {e}")
        return None

def get_clothing_suggestion(temperature):
    """
    Provide clothing suggestions based on temperature.
    
    Args:
        temperature (float): Temperature in Celsius
        
    Returns:
        str: Clothing suggestion
    """
    if temperature < -10:
        return "[VERY COLD] Extremely cold! Wear heavy winter coat, thermal underwear, warm boots, gloves, scarf, and hat."
    elif temperature < 0:
        return "[COLD] Very cold! Wear winter coat, warm layers, insulated boots, gloves, and hat."
    elif temperature < 10:
        return "[COOL] Cold! Wear warm jacket, sweater, long pants, and closed shoes."
    elif temperature < 15:
        return "[MILD-COOL] Cool! Wear light jacket or sweater, long pants, and comfortable shoes."
    elif temperature < 20:
        return "[MILD] Mild! Wear light jacket or cardigan, t-shirt, and jeans or casual pants."
    elif temperature < 25:
        return "[COMFORTABLE] Comfortable! Wear t-shirt, light pants or shorts, and comfortable shoes."
    elif temperature < 30:
        return "[WARM] Warm! Wear light clothing, shorts, t-shirt, and breathable fabrics."
    else:
        return "[HOT] Very hot! Wear minimal clothing, light colors, breathable fabrics, and stay hydrated!"

def get_weather_description(forecast_item):
    """
    Extract weather description from WeatherAPI.com forecast data.
    
    Args:
        forecast_item (dict): Single forecast item from API
        
    Returns:
        str: Weather description
    """
    try:
        condition = forecast_item['condition']['text']
        return condition
    except (KeyError, IndexError):
        return "Unknown"

def main():
    # API configuration
    API_KEY = "75df1ac3aef349dabd5163456261202"  # Replace with your WeatherAPI.com API key
    
    # Check if running in test mode (for automated environments)
    test_mode = len(sys.argv) > 1 and sys.argv[1] == "--test"
    
    print("[WEATHER] Weather Dress Advisor")
    print("=" * 30)
    
    if test_mode:
        # Test mode with a default city
        city = "London"
        print(f"[TEST] Running in test mode with city: {city}")
    else:
        # Get city input from user
        try:
            city = input("Enter city name (or 'quit' to exit): ").strip()
        except EOFError:
            print("[ERROR] Cannot read input. Use --test flag for automated testing.")
            return
        
        if city.lower() == 'quit':
            print("Goodbye!")
            return
            
        if not city:
            print("Please enter a valid city name.")
            return
        
        # Check if API key is set
    if API_KEY == "YOUR_API_KEY_HERE":
        print("[WARNING] Please set your WeatherAPI.com API key in the script.")
        print("You can get a free API key from: https://www.weatherapi.com/")
        print("Replace 'YOUR_API_KEY_HERE' with your actual API key.")
        return
    
    print(f"\n[SEARCH] Fetching weather forecast data for {city}...")
    
    # Get weather data
    weather_data = get_weather_data(API_KEY, city)
    
    if weather_data is None:
        print("[ERROR] Failed to fetch weather data. Please try again.")
        return
    
    # Check if city was found
    if 'error' in weather_data:
        print(f"[ERROR] {weather_data['error']['message']}")
        return
    
    # Extract weather information
    try:
        location = weather_data['location']
        city_name = location['name']
        country = location.get('country', '')
        forecast_days = weather_data['forecast']['forecastday']
        
        # Display weather information
        print(f"\n[LOCATION] Location: {city_name}, {country}")
        print(f"[FORECAST] 5-Day Weather Forecast:\n")
        
        # Display forecast for each day
        for day_data in forecast_days:
            date = day_data['date']
            day_condition = day_data['day']['condition']['text']
            max_temp = day_data['day']['maxtemp_c']
            min_temp = day_data['day']['mintemp_c']
            avg_temp = day_data['day']['avgtemp_c']
            humidity = day_data['day']['avghumidity']
            
            print(f"[DATE] {date}")
            print(f"   [CONDITIONS] {day_condition}")
            print(f"   [TEMP] High: {max_temp}°C, Low: {min_temp}°C, Average: {avg_temp}°C")
            print(f"   [HUMIDITY] {humidity}%")
            
            # Get and display clothing suggestion for average temperature
            clothing_suggestion = get_clothing_suggestion(avg_temp)
            print(f"   [CLOTHING] {clothing_suggestion}")
            print()
            
            # Show hourly forecast for first day
            if day_data == forecast_days[0]:
                print("   [HOURLY] Next 8 hours:")
                for hour in day_data['hour'][:8]:
                    hour_time = hour['time'].split(' ')[1]
                    hour_temp = hour['temp_c']
                    hour_condition = hour['condition']['text']
                    print(f"      {hour_time}: {hour_temp}°C - {hour_condition}")
                print()
        
        print("=" * 50 + "\n")
        
    except KeyError as e:
        print(f"[ERROR] Error parsing weather data: Missing key {e}")
        print("Please try again.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nProgram interrupted. Goodbye!")
        sys.exit(0)
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}")
        sys.exit(1)
