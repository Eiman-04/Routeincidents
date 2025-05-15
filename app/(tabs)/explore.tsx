import axios from 'axios';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface Incident {
  id: number;
  latitude: string;
  longitude: string;
  description: string;
  date: string;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

const IncidentsMap: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [location, setLocation] = useState<LocationCoords | null>(null);

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'La permission de localisation est nécessaire.');
      return;
    }

    const userLocation = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude,
    });
  };

  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const radlat1 = (Math.PI * lat1) / 180;
    const radlat2 = (Math.PI * lat2) / 180;
    const theta = lon1 - lon2;
    const radtheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(Math.min(Math.max(dist, -1), 1)); // sécurité pour éviter NaN
    dist = (dist * 180) / Math.PI;
    dist *= 60 * 1.1515 * 1.609344;
    return dist;
  };

  const handleResolveIncident = (incidentId: number) => {
    Alert.alert('Incident résolu ?', 'Voulez-vous supprimer cet incident ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        onPress: () => {
          axios
            .delete(`http://192.168.1.176:3000/incidents/${incidentId}`)
            .then(() => {
              setIncidents(prev => prev.filter(i => i.id !== incidentId));
              Alert.alert('Succès', "L'incident a été supprimé.");
            })
            .catch(error => {
              console.error('Erreur lors de la suppression', error);
              Alert.alert('Erreur', "Impossible de supprimer l'incident.");
            });
        },
      },
    ]);
  };

  useEffect(() => {
    axios
      .get('http://192.168.1.176:3000/incidents')
      .then(response => setIncidents(response.data))
      .catch(error => {
        console.error('Erreur de chargement des incidents', error);
        Alert.alert('Erreur', 'Impossible de charger les incidents');
      });
  }, []);

  useEffect(() => {
    if (location) {
      incidents.forEach(incident => {
        const distance = getDistance(
          location.latitude,
          location.longitude,
          parseFloat(incident.latitude),
          parseFloat(incident.longitude)
        );
        if (distance < 1) {
          Alert.alert('🚨 Incident proche !', `Proximité : ${incident.description}`);
        }
      });
    }
  }, [location, incidents]);

  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗺️ Carte des Incidents</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 34.2704,
          longitude: -6.5803,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      >
        {incidents.map(incident => (
          <Marker
            key={incident.id}
            coordinate={{
              latitude: parseFloat(incident.latitude),
              longitude: parseFloat(incident.longitude),
            }}
            title={incident.description}
            description={`Date : ${incident.date}`}
            onCalloutPress={() => handleResolveIncident(incident.id)}
          />
        ))}
      </MapView>

      <TouchableOpacity
        style={[styles.callButton, { backgroundColor: '#D32F2F', bottom: 100 }]}
        onPress={() => Linking.openURL('tel:19')}
      >
        <Text style={styles.callButtonText}>📞 Police</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.callButton, { backgroundColor: '#1976D2', bottom: 40 }]}
        onPress={() => Linking.openURL('tel:15')}
      >
        <Text style={styles.callButtonText}>🚑 Ambulance</Text>
      </TouchableOpacity>
    </View>
  );
};

export default IncidentsMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 12,
    textAlign: 'center',
    color: '#0D47A1',
    backgroundColor: '#BBDEFB',
    borderBottomWidth: 1,
    borderColor: '#90CAF9',
  },
  map: {
    flex: 1,
  },
  callButton: {
    position: 'absolute',
    left: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  callButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
