import axios from 'axios';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [incidents, setIncidents] = useState([]);

  // Récupère la position actuelle
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Autorisez la géolocalisation');
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
  };

  // Ajoute un incident avec la géolocalisation
  const addIncident = async () => {
    if (!description.trim() || !location) return;

    try {
      await axios.post('http://192.168.1.176:3000/incidents', {
        description,
        latitude: location.latitude,
        longitude: location.longitude,
      });
      setDescription('');
      fetchIncidents();
    } catch (err) {
      Alert.alert('Erreur', "Impossible d'ajouter l'incident");
    }
  };

  // Récupère les incidents depuis le backend
  const fetchIncidents = async () => {
    try {
      const res = await axios.get('http://192.168.1.176:3000/incidents');
      setIncidents(res.data);
    } catch (err) {
      console.log('Erreur chargement incidents :', err.message);
    }
  };

  // Vérifie s'il y a un incident proche (dans un rayon de 500m)
  const checkProximity = () => {
    if (!location) return;

    incidents.forEach((incident) => {
      const distance = getDistanceFromLatLonInKm(
        location.latitude,
        location.longitude,
        incident.latitude,
        incident.longitude
      );

      if (distance < 0.5) {
        Notifications.scheduleNotificationAsync({
          content: {
            title: '🚧 Problème proche',
            body: incident.description,
          },
          trigger: null,
        });
      }
    });
  };

  useEffect(() => {
    getLocation();
    fetchIncidents();

    const interval = setInterval(() => {
      getLocation();
      fetchIncidents();
    }, 10000); // vérifie toutes les 10s

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (incidents.length && location) {
      checkProximity();
    }
  }, [incidents, location]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Signaler un Incident Routier</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Route bloquée, accident..."
        value={description}
        onChangeText={setDescription}
      />
      <Button title="Signaler" onPress={addIncident} />

      <FlatList
        data={incidents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.description}</Text>
            <Text style={styles.coord}>Lat: {item.latitude} / Lon: {item.longitude}</Text>
          </View>
        )}
      />
    </View>
  );
}

// Fonction pour calculer la distance entre 2 points GPS
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, marginBottom: 10, textAlign: 'center' },
  input: { borderColor: '#ccc', borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 6 },
  item: { padding: 10, backgroundColor: '#f0f0f0', borderRadius: 6, marginVertical: 5 },
  coord: { fontSize: 12, color: 'gray' },
});
