import axios from 'axios';
import { useEffect, useState } from 'react';
import { Alert, Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function RecetteDetailScreen({ route }) {
  const { idMeal } = route.params;
  const [recipeDetail, setRecipeDetail] = useState(null);

  useEffect(() => {
    if (idMeal) {
      fetchRecipeDetail();
    }
  }, [idMeal]);

  const fetchRecipeDetail = async () => {
    try {
      const res = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
      if (res.data.meals && res.data.meals.length > 0) {
        setRecipeDetail(res.data.meals[0]);
      } else {
        console.error("Recette non trouvée.");
      }
    } catch (error) {
      console.error('Erreur API:', error);
    }
  };

  const handleAddToFavorites = () => {
    Alert.alert('Ajouté aux favoris', 'Cette recette a été ajoutée à vos favoris.');
    // Here you can implement actual favorite functionality (like storing in AsyncStorage or database)
  };

  if (!recipeDetail) {
    return <Text>Chargement...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: recipeDetail.strMealThumb }} style={styles.image} />
      <Text style={styles.title}>{recipeDetail.strMeal}</Text>
      <Text style={styles.category}>{recipeDetail.strCategory}</Text>

      <Text style={styles.subTitle}>Ingrédients :</Text>
      <View style={styles.ingredientsContainer}>
        {Object.keys(recipeDetail)
          .filter(key => key.includes('strIngredient') && recipeDetail[key])
          .map((key, index) => (
            <Text key={index} style={styles.ingredient}>
              {recipeDetail[key]}
            </Text>
          ))}
      </View>

      <Text style={styles.subTitle}>Étapes de préparation :</Text>
      <Text style={styles.instructions}>{recipeDetail.strInstructions}</Text>

      <Button title="Ajouter aux favoris" onPress={handleAddToFavorites} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  image: { width: '100%', height: 250, borderRadius: 10, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  category: { fontSize: 18, color: 'gray', marginBottom: 10 },
  subTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  ingredientsContainer: { marginBottom: 20 },
  ingredient: { fontSize: 16, marginVertical: 5 },
  instructions: { fontSize: 16, marginBottom: 20 },
});
