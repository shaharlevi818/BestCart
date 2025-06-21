
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';

import { RootStackParamList } from '../navigation/AppNavigator';
import { shoppingListAPI } from '../api/shoppingListAPIService';
import ShoppingListItem from '../components/ShoppingListItem';
import { ShoppingList } from '../types';

type ShoppingListsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ShoppingListsScreen() {
  const navigation = useNavigation<ShoppingListsNavigationProp>();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This function fetches live data from your server.
  const loadShoppingLists = useCallback(async () => {
    console.log("Attempting to fetch lists from API...");
    setIsLoading(true);
    setError(null);
    try {
      const fetchedLists = await shoppingListAPI.getAll();
      setLists(fetchedLists);
    } catch (e) {
      setError('Failed to load shopping lists.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadShoppingLists();
    }, [loadShoppingLists]) // We depend on the memoized loadShoppingLists function
  );

  const handleDelete = (listId: number) => {
    Alert.alert("Delete List", "Are you sure you want to delete this list?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const originalLists = lists;
          setLists(prevLists => prevLists.filter(list => list.id !== listId));
          try {
            await shoppingListAPI.delete(listId);
          } catch (e) {
            Alert.alert("Error", "Failed to delete the list.");
            setLists(originalLists);
          }
        },
      },
    ]);
  };
  
  const handleEdit = (listId: number) => {
      navigation.navigate('EditListScreen', { listId });
      // This will navigate to the EditListScreen and pass the listId as a parameter.
  };

  const handleNewListPress = () => {
      Alert.alert(
          "Create a List",
          "Do you want to use a template or start from scratch?",
          [
              { text: "Use a Template", onPress: () => Alert.alert("Coming Soon!") },
              { text: "Start from Scratch", onPress: () => navigation.navigate('NewListModal') },
              { text: "Cancel", style: "cancel" },
          ]
      );
  };
  
  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  if (error) {
    return <View style={styles.centered}><Text style={styles.errorText}>{error}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.newListButton} onPress={handleNewListPress}>
        <Ionicons name="add-circle-outline" size={22} color="white" />
        <Text style={styles.newListButtonText}>Create New List</Text>
      </Pressable>

      <FlatList
        data={lists} // <-- FIX: This now correctly uses the 'lists' state from the API.
        renderItem={({ item }) => (
          <ShoppingListItem 
            item={item} 
            onPress={() => navigation.navigate('ListDetailScreen', { listId: item.id })}
            onDelete={() => handleDelete(item.id)}
            onEdit={() => handleEdit(item.id)} // Pass the edit handler
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text>You have no shopping lists.</Text>
          </View>
        }
        onRefresh={loadShoppingLists} // Allow pull-to-refresh
        refreshing={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8f8' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red' },
    newListButton: { 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF', 
        paddingVertical: 15, 
        margin: 15, 
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    newListButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});
