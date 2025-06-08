import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// --- IMPORTS FOR TYPING NAVIGATION ---
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

// --- OTHER IMPORTS ---
import ShoppingListItem from '../components/ShoppingListItem';
import { ALL_SHOPPING_LISTS } from '../data/mockData';
import { ShoppingList } from '../types';


// Define the specific type for the navigation prop we want to use.
// We want the one from the Root Stack, which knows about the modal.
type ShoppingListsNavigationProp = NativeStackNavigationProp<RootStackParamList>;


export default function ShoppingListsScreen() {
  // 1. Get the navigation object and apply our specific type to it.
  const navigation = useNavigation<ShoppingListsNavigationProp>();

  // Data Logic...
  const currentUserId = 2;
  const userLists = ALL_SHOPPING_LISTS.filter(
    list => list.user_id === currentUserId && list.is_template === false
  );
  const sortedLists = userLists.sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  // --- EVENT HANDLERS ---
  const handleNewListPress = () => {
    Alert.alert(
      "Create a List",
      "Do you want to use a template or start from scratch?",
      [
        { text: "Use a Template", onPress: () => Alert.alert("Coming Soon!") },
        // 2. This call is now type-safe and the error will be gone!
        { text: "Start from Scratch", onPress: () => navigation.navigate('NewListModal') },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleListItemPress = (item: ShoppingList) => {
    // This navigation is also now correctly typed
    navigation.navigate('ListDetailScreen', { listId: item.id });
  };

  const renderListItem = ({ item }: { item: ShoppingList }) => (
    <ShoppingListItem item={item} onPress={() => handleListItemPress(item)} />
  );

  return (
    <View style={styles.container}>
      <Pressable style={styles.newListButton} onPress={handleNewListPress}>
        <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
        <Text style={styles.newListButtonText}>Create New List</Text>
      </Pressable>

      <FlatList
        data={sortedLists}
        renderItem={renderListItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You don't have any shopping lists yet.</Text>
            <Text style={styles.emptyText}>Tap 'Create New List' to get started!</Text>
          </View>
        }
      />
    </View>
  );
}

// Styles remain the same...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  newListButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F0FE', paddingVertical: 15, margin: 16, borderRadius: 8, borderWidth: 1, borderColor: '#007AFF' },
  newListButtonText: { color: '#007AFF', fontSize: 18, fontWeight: '600', marginLeft: 8 },
  listContentContainer: { paddingBottom: 20, flexGrow: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666' },
});