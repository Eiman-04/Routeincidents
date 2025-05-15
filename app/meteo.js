import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const API_KEY = '8f970a9223aeb4c1fe0ba996f98ea3db'; // Remplace par ta propre clé API

export default function WeatherScreen() {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async (ville = '') => {
    setLoading(true);
    setError('');
    try {
      let url;

      if (ville) {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${ville}&appid=${API_KEY}&units=metric&lang=fr`;
      } else {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError("Permission de localisation refusée. Veuillez activer la localisation.");
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        setLocation({ latitude, longitude });

        url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=fr`;
      }

      const response = await axios.get(url);
      const dailyForecast = response.data.list.filter((item) =>
        item.dt_txt.includes('12:00:00')
      );

      setCity(response.data.city.name);
      setForecast(dailyForecast);
    } catch (err) {
      setError("Erreur réseau ou ville non trouvée.");
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(() => {
    if (search.trim()) {
      fetchForecast(search.trim());
    } else {
      setError("Veuillez entrer un nom de ville.");
    }
  }, [search]);

  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return 'weather-sunny';
      case 'clouds':
        return 'weather-cloudy';
      case 'rain':
        return 'weather-rainy';
      case 'snow':
        return 'weather-snowy';
      case 'thunderstorm':
        return 'weather-lightning';
      case 'drizzle':
        return 'weather-hail';
      case 'mist':
      case 'fog':
        return 'weather-fog';
      default:
        return 'weather-partly-cloudy';
    }
  };

  const showWeatherDetails = (item) => {
    Alert.alert(
      `Prévisions pour ${new Date(item.dt_txt).toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })}`,
      `Température: ${item.main.temp}°C\nDescription: ${item.weather[0].description}\nVent: ${item.wind.speed} km/h\nHumidité: ${item.main.humidity}%`,
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00aaff" />
        <Text style={styles.loadingText}>Chargement des données météo…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.city}>Prévisions pour {city}</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Entrer une ville..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={handleSearch} style={styles.button}>
            <Text style={styles.buttonText}>🔍</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {location && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={city}
            />
          </MapView>
        )}

        <FlatList
          data={forecast}
          horizontal
          keyExtractor={(item) => item.dt.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => showWeatherDetails(item)} // Afficher les détails sur clic
              >
                <Text style={styles.date}>
                  {new Date(item.dt_txt).toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>

                {/* Icône météo */}
                <MaterialCommunityIcons
                  name={getWeatherIcon(item.weather[0].main)}
                  size={60}
                  color="#007acc"
                />

                <Text style={styles.temp}>{item.main.temp}°C</Text>
                <Text style={styles.desc}>{item.weather[0].description}</Text>
                <Text style={styles.wind}>Vent: {item.wind.speed} km/h</Text>
                <Text style={styles.humidity}>Humidité: {item.main.humidity}%</Text>
              </TouchableOpacity>
            );
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf6ff',
  },
  scrollContainer: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  city: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    color: '#007acc',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#007acc',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  map: {
    width: '100%',
    height: 220,
    marginVertical: 15,
    borderRadius: 12,
    borderColor: '#007acc',
    borderWidth: 1,
  },
  listContainer: {
    paddingVertical: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginRight: 12,
    borderRadius: 16,
    alignItems: 'center',
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0f0ff',
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  temp: {
    fontSize: 24,
    color: '#ff7e5f',
    fontWeight: 'bold',
  },
  desc: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 5,
    textAlign: 'center',
    color: '#555',
  },
  wind: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  humidity: {
    fontSize: 14,
    color: '#888',
  },
});
