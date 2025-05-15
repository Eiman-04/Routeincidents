import axios from 'axios';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RecettesScreen() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ingredient, setIngredient] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRecipes();
  }, [searchQuery]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchQuery}`);
      setRecipes(res.data.meals || []);
    } catch (error) {
      console.error('Erreur API:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const shareRecipe = async (recipe) => {
    const shareOptions = {
      message: recipe.strInstructions, // Instructions to share
      url: recipe.strMealThumb, // Image URL to share (if any)
      title: 'Partager cette recette', // Title of the shared content
    };

    try {
      await Share.share(shareOptions); // Use Share API to share content
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Recherche par ingrédient"
        value={searchQuery}
        onChangeText={handleSearchChange}
      />
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.idMeal.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.strMeal}</Text>
            <Image source={{ uri: item.strMealThumb }} style={styles.thumbnail} />
            <TouchableOpacity onPress={() => shareRecipe(item)}>
              <Text style={styles.shareButton}>Partager</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
  card: { marginBottom: 15, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 10 },
  thumbnail: { height: 200, width: '100%', borderRadius: 10 },
  title: { fontSize: 16, fontWeight: 'bold' },
  shareButton: { color: '#1e90ff', marginTop: 5, textAlign: 'center' },
});
