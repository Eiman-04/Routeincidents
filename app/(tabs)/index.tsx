import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#64B5F6', '#BBDEFB']} style={styles.container}>
      {/* Logo */}
      <Image source={require('../../assets/logo.png')} style={styles.logo} />

      {/* Titre */}
      <Text style={styles.title}>Bienvenue sur l'app de Signalement des Problèmes Routiers</Text>

      {/* Boutons */}
      <TouchableOpacity style={styles.button} onPress={() => router.push('/premierssecours')}>
        <Ionicons name="medkit" size={24} color="white" />
        <Text style={styles.buttonText}>Premiers secours</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/signaler')}>
        <Ionicons name="warning" size={24} color="white" />
        <Text style={styles.buttonText}>Signaler un problème</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/incidents')}>
        <Ionicons name="alert-circle" size={24} color="white" />
        <Text style={styles.buttonText}>Voir les incidents</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/meteo')}>
        <Ionicons name="cloud-outline" size={24} color="white" />
        <Text style={styles.buttonText}>Météo</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
    borderRadius: 120,
    borderWidth: 3,
    borderColor: 'white',
  },
  title: {
    fontSize: 26,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
    width: '85%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  buttonText: {
    fontSize: 17,
    color: 'white',
    marginLeft: 12,
    fontWeight: '500',
  },
});
