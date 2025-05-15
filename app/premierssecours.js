import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { useState } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Importer les données JSON
import firstAidSteps from './firstAidData.json';

export default function FirstAidScreen() {
  const [selectedEmergency, setSelectedEmergency] = useState(null);

  const handleSelectEmergency = (item) => {
    setSelectedEmergency(item);
  };

  const handleCloseDetails = () => {
    setSelectedEmergency(null);
  };

  const handleEmergencyLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Erreur', 'Permission refusée pour la localisation.');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>الاسعافات الأولية</Text>

      <Button title="📍 Ma position actuelle" onPress={handleEmergencyLocation} color="#1976D2" style={styles.positionButton} />

      {!selectedEmergency ? (
        firstAidSteps.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleSelectEmergency(item)}
            style={styles.card}
          >
            <View style={styles.cardContent}>
              <MaterialCommunityIcons name={item.icon} size={30} color="#1976D2" style={styles.icon} />
              <Text style={styles.title}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.detailContainer}>
          <Button title="⬅️ Retour" onPress={handleCloseDetails} color="#FF6347" />
          <Text style={styles.detailTitle}>{selectedEmergency.title}</Text>
          <Text style={styles.stepTitle}>Les étapes de premiers secours :</Text>
          {selectedEmergency.steps.map((step, index) => (
            <Text key={index} style={styles.step}>{index + 1}. {step}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Roboto',
  },
  positionButton: {
    marginBottom: 20,
    borderRadius: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 18,
    marginBottom: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Roboto',
  },
  detailContainer: {
    padding: 25,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    marginTop: 20,
    elevation: 5,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 15,
    color: '#1976D2',
    fontFamily: 'Roboto',
  },
  stepTitle: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: '600',
    color: '#555',
    fontFamily: 'Roboto',
  },
  step: {
    fontSize: 18,
    marginBottom: 10,
    paddingLeft: 15,
    color: '#444',
    fontFamily: 'Roboto',
  },
});
