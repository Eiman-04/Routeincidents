import axios from 'axios';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const ReportIncidentScreen = () => {
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState(null);
  const [markerCoords, setMarkerCoords] = useState(null);
  const mapRef = useRef(null);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erreur', 'Permission de localisation non accordée');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      setMarkerCoords({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setDate(new Date().toISOString());
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'obtenir la position");
      console.error(error);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const handleSubmit = async () => {
    if (!description || !markerCoords || !date) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      await axios.post('http://192.168.1.176:3000/incidents', {
        description,
        latitude: markerCoords.latitude,
        longitude: markerCoords.longitude,
        date,
      });
      Alert.alert('Succès', 'Incident signalé avec succès');
      setDescription('');
    } catch (error) {
      console.error('Erreur de soumission :', error.message);
      Alert.alert('Erreur', "Impossible de signaler l'incident");
    }
  };

  const centerMap = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>🛑 Signaler un Incident</Text>

        <TextInput
          style={styles.input}
          placeholder="Décrivez brièvement l'incident"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {location && (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              setMarkerCoords({ latitude, longitude });
            }}
          >
            {markerCoords && (
              <Marker
                coordinate={markerCoords}
                title="Incident ici"
                description={description}
                pinColor="red"
              />
            )}
          </MapView>
        )}

        <TouchableOpacity style={styles.buttonBlue} onPress={centerMap}>
          <Text style={styles.buttonText}>📍 Centrer sur ma position</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonGreen} onPress={handleSubmit}>
          <Text style={styles.buttonText}>✅ Soumettre l'incident</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { padding: 20, gap: 15 },
  title: {
    marginTop: 40,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  map: {
    height: 300,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonBlue: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonGreen: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default ReportIncidentScreen;
