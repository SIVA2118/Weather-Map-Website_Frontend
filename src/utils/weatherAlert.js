export function getWeatherAlert(weather, aqi) {
    if (!weather || weather.error) return null;

    const condition = weather.weather?.[0]?.main?.toLowerCase() || '';
    const temp = weather.main?.temp;
    const humidity = weather.main?.humidity;
    const windSpeed = weather.wind?.speed;
    const aqiValue = aqi?.list?.[0]?.main?.aqi;
    const pm25 = aqi?.list?.[0]?.components?.pm2_5;
    const pm10 = aqi?.list?.[0]?.components?.pm10;

    if (condition === 'thunderstorm') {
        return {
            level: 'high',
            message: 'Thunderstorm risk. Stay indoors if possible.',
            details: [
                'Avoid open spaces and unplug sensitive electrical devices.',
                'Travel only if necessary until lightning activity drops.'
            ]
        };
    }

    if (condition === 'snow') {
        return {
            level: 'medium',
            message: 'Snow conditions detected. Roads may be slippery.',
            details: [
                'Drive slowly and maintain extra braking distance.',
                'Wear warm layers and limit long outdoor exposure.'
            ]
        };
    }

    if (condition === 'rain' || condition === 'drizzle') {
        return {
            level: 'medium',
            message: 'Rain expected. Carry an umbrella.',
            details: [
                `Humidity: ${typeof humidity === 'number' ? `${humidity}%` : 'N/A'}`,
                `Wind: ${typeof windSpeed === 'number' ? `${windSpeed} m/s` : 'N/A'}`,
                'Use caution on wet roads and low-visibility stretches.'
            ]
        };
    }

    if (typeof temp === 'number' && temp >= 38) {
        return {
            level: 'high',
            message: 'Extreme heat alert. Stay hydrated and avoid direct sun.',
            details: [
                'High sunlight and heat can cause dehydration quickly.',
                'Take frequent shade breaks and avoid strenuous activity.',
                'Check vulnerable people for signs of heat exhaustion.',
                `Current temperature: ${Math.round(temp)}°C`
            ]
        };
    }

    if (typeof temp === 'number' && temp >= 35) {
        return {
            level: 'high',
            message: 'High sunlight alert. UV and heat exposure may be intense.',
            details: [
                'Avoid direct sun between 11 AM and 3 PM when possible.',
                'Use sunscreen, sunglasses, and drink water regularly.',
                `Current temperature: ${Math.round(temp)}°C`
            ]
        };
    }

    if (typeof temp === 'number' && temp <= 3) {
        return {
            level: 'medium',
            message: 'Low temperature warning. Dress warm and limit exposure.',
            details: [
                'Layer clothing and keep extremities covered.',
                'Limit prolonged outdoor exposure, especially at night.'
            ]
        };
    }

    if (aqiValue >= 4) {
        return {
            level: 'high',
            message: 'Poor air quality detected. Reduce outdoor activity.',
            details: [
                `AQI level: ${aqiValue} (${aqiValue === 4 ? 'Poor' : 'Very Poor'})`,
                `PM2.5: ${typeof pm25 === 'number' ? `${pm25.toFixed(1)} ug/m3` : 'N/A'}`,
                `PM10: ${typeof pm10 === 'number' ? `${pm10.toFixed(1)} ug/m3` : 'N/A'}`
            ]
        };
    }

    return null;
}
