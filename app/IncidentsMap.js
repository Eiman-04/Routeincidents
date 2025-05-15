import axios from 'axios';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, Linking, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const IncidentsMap = () => {
  const [incidents, setIncidents] = useState([]);
  const [location, setLocation] = useState(null);

  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'La permission de localisation est nécessaire.');
      return;
    }

    const userLocation = await Location.getCurrentPositionAsync({});
    setLocation(userLocation.coords);
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const radlat1 = (Math.PI * lat1) / 180;
    const radlat2 = (Math.PI * lat2) / 180;
    const theta = lon1 - lon2;
    const radtheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515 * 1.609344;
    return dist;
  };

  const handleResolveIncident = (incidentId) => {
    const id = parseInt(incidentId, 10);
    Alert.alert(
      "Incident résolu ?",
      "Voulez-vous supprimer cet incident ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          onPress: () => {
            axios.delete(`http://192.168.1.176:3000/incidents/${id}`)
              .then(() => {
                setIncidents(prev => prev.filter(i => i.id !== id));
                Alert.alert("Succès", "L'incident a été supprimé.");
              })
              .catch((error) => {
                console.error("Erreur lors de la suppression", error);
                Alert.alert("Erreur", "Impossible de supprimer l'incident.");
              });
          }
        }
      ]
    );
  };

  useEffect(() => {
    axios.get('http://192.168.1.176:3000/incidents')
      .then((response) => setIncidents(response.data))
      .catch((error) => {
        console.error('Erreur de chargement des incidents', error);
        Alert.alert('Erreur', 'Impossible de charger les incidents');
      });
  }, []);

  useEffect(() => {
    if (location && incidents.length > 0) {
      incidents.forEach((incident) => {
        const distance = getDistance(
          location.latitude,
          location.longitude,
          parseFloat(incident.latitude),
          parseFloat(incident.longitude)
        );

        if (distance < 1) {
          Alert.alert(
            "🚨 Incident proche !",
            `Un incident a été signalé à proximité :\n${incident.description}`
          );
        }
      });
    }
  }, [location, incidents]);

  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, padding: 10 }}>Carte des Incidents</Text>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 34.2704,
          longitude: -6.5803,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {incidents.map((incident) => (
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
        style={styles.callButtonPolice}
        onPress={() => Linking.openURL('tel:19')}
      >
        <Text style={styles.callButtonText}>📞 Dépannage</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.callButtonAmbulance}
        onPress={() => Linking.openURL('tel:15')}
      >
        <Text style={styles.callButtonText}>🚑 Ambulance</Text>
      </TouchableOpacity>
    </View>
  );
};

export default IncidentsMap;

const styles = {
  callButtonPolice: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 10,
  },
  callButtonAmbulance: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 10,
  },
  callButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
};
