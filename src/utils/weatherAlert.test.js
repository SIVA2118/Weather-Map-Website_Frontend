import test from 'node:test';
import assert from 'node:assert/strict';
import { getWeatherAlert } from './weatherAlert.js';

const buildWeather = (main, temp = 25) => ({
    weather: [{ main }],
    main: { temp }
});

const buildAqi = (aqi) => ({
    list: [{ main: { aqi } }]
});

test('returns thunderstorm alert as highest priority', () => {
    const alert = getWeatherAlert(buildWeather('Thunderstorm', 40), buildAqi(5));
    assert.equal(alert.level, 'high');
    assert.equal(alert.message, 'Thunderstorm risk. Stay indoors if possible.');
    assert.ok(Array.isArray(alert.details));
    assert.ok(alert.details.length > 0);
});

test('returns rain alert', () => {
    const alert = getWeatherAlert(buildWeather('Rain', 28), buildAqi(2));
    assert.equal(alert.level, 'medium');
    assert.equal(alert.message, 'Rain expected. Carry an umbrella.');
    assert.ok(alert.details.some((item) => item.includes('Humidity:')));
    assert.ok(alert.details.some((item) => item.includes('Wind:')));
});

test('returns high sunlight alert for clear hot weather', () => {
    const alert = getWeatherAlert(buildWeather('Clear', 36), buildAqi(2));
    assert.equal(alert.level, 'high');
    assert.equal(alert.message, 'High sunlight alert. UV and heat exposure may be intense.');
    assert.ok(alert.details.some((item) => item.includes('Current temperature')));
});

test('returns high sunlight alert for hot cloudy weather', () => {
    const alert = getWeatherAlert(buildWeather('Clouds', 37), buildAqi(2));
    assert.equal(alert.level, 'high');
    assert.equal(alert.message, 'High sunlight alert. UV and heat exposure may be intense.');
});

test('returns heat alert when temperature is extreme', () => {
    const alert = getWeatherAlert(buildWeather('Clouds', 39), buildAqi(2));
    assert.equal(alert.level, 'high');
    assert.equal(alert.message, 'Extreme heat alert. Stay hydrated and avoid direct sun.');
});

test('returns poor air quality alert when AQI is high', () => {
    const alert = getWeatherAlert(buildWeather('Clouds', 26), {
        list: [{ main: { aqi: 4 }, components: { pm2_5: 82.7, pm10: 121.3 } }]
    });
    assert.equal(alert.level, 'high');
    assert.equal(alert.message, 'Poor air quality detected. Reduce outdoor activity.');
    assert.ok(alert.details.some((item) => item.includes('PM2.5')));
    assert.ok(alert.details.some((item) => item.includes('PM10')));
});

test('returns null when no alert condition matches', () => {
    const alert = getWeatherAlert(buildWeather('Clear', 24), buildAqi(2));
    assert.equal(alert, null);
});
