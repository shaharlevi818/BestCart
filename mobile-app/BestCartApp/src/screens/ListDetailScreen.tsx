// src/screens/ListDetailScreen.tsx

import React, { useState, useLayoutEffect, useCallback, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ActivityIndicator, 
    Alert, 
    Pressable, 
    TextInput, 
    FlatList,
    SectionList,
    Keyboard // Import Keyboard
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

import { RootStackParamList } from '../navigation/AppNavigator';
import { shoppingListAPI } from '../api/shoppingListAPIService';
import { productAPI } from '../api/productAPIService';
import { ShoppingList, DisplayListItem, ProductSearchResult, ShoppingListProductView } from '../types';
import ListItemRow from '../components/ListItemRow';
import SearchResultItem from '../components/SearchResultItem';

type ListDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'ListDetailScreen'>;

export default function ListDetailScreen({ route, navigation }: ListDetailScreenProps) {
  const { listId } = route.params;

  const [list, setList] = useState<ShoppingList | null>(null);
  const [itemSections, setItemSections] = useState<{ title: string; data: DisplayListItem[] }[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data Transformation Functions ---
  const mapServerDataToDisplayItems = (serverItems: ShoppingListProductView[]): DisplayListItem[] => {
    if (!Array.isArray(serverItems)) return [];
    return serverItems.filter(Boolean).map(item => ({
        id: item.id,
        shopping_list_id: item.list_id,
        product_id: item.product_id,
        productName: item.name,
        department: item.department_display || 'Other',
        department_grouping: item.department_display || 'Other',
        manufacturer: item.manufacturer,
        quantity: item.quantity,
        units: item.units_display,
        is_checked: item.is_checked,
        notes: item.notes,
    }));
  };

  const groupItemsByDepartment = (items: DisplayListItem[]) => {
    if (!items || items.length === 0) return [];
    const grouped = items.reduce((acc, item) => {
      const department = item.department || 'Other';
      if (!acc[department]) acc[department] = [];
      acc[department].push(item);
      return acc;
    }, {} as Record<string, DisplayListItem[]>);
    return Object.keys(grouped).map(title => ({ title, data: grouped[title] })).sort((a, b) => a.title.localeCompare(b.title));
  };
  
// src/screens/ListDetailScreen.tsx

  useFocusEffect(
    useCallback(() => {
      const loadListDetails = async () => {
        console.log("loadlistdetails (74): Loading list details for ID:", listId);
          setIsLoading(true);
          setError(null);
          try {
            console.log("loadlistdetails (78):  trying Loading list details for ID:", listId);
            const [fetchedList, fetchedItemsFromServer] = await Promise.all([
              shoppingListAPI.getById(listId),
              shoppingListAPI.getListProducts(listId)
            ]);
            
            // 1. Log the raw data to confirm its structure
            console.log("API response for products:", JSON.stringify(fetchedItemsFromServer, null, 2));
            
            // 2. Map the raw server data to the format your UI needs
            const displayItems = mapServerDataToDisplayItems(fetchedItemsFromServer || []);
            console.log("loadlistdetails (89): after mapping, displayItems:", JSON.stringify(displayItems, null, 2));
            // 3. Group the display-ready items into sections
            const sections = groupItemsByDepartment(displayItems);
            console.log("loadlistdetails (92): after grouping, sections:", JSON.stringify(sections, null, 2));
            // 4. Set the state once with the final, correctly-formatted data
            setList(fetchedList);
            console.log("loadlistdetails (95): setList with fetchedList:", JSON.stringify(fetchedList, null, 2));
            setItemSections(sections);
            console.log("loadlistdetails (98): setItemSections with sections:", JSON.stringify(sections, null, 2));
            
          } catch (err) {
            // It's good practice to log the actual error for debugging
            console.error("Failed to load list details:", err); 
            setError("Failed to load list details.");
          } finally {
            console.log("loadlistdetails (106): Finished loading list details for ID:", listId);
            setIsLoading(false);
          }
      };
      
      loadListDetails();

    }, [listId]) // The dependency array is simplified to just listId
  );

  useEffect(() => {
    if (searchText.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const searchTimer = setTimeout(async () => {
      const userId = 1; // Placeholder
      const results = await productAPI.search(searchText, userId);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(searchTimer);
  }, [searchText]);

  useLayoutEffect(() => {
    if (list) {
      navigation.setOptions({ title: list.name });
    } else {
      // Set a default title or hide it while loading
      navigation.setOptions({ title: '' });
    }
  }, [navigation, list]);

  // --- THIS IS THE UPDATED FUNCTION ---
  const handleSelectSearchResult = async (product: ProductSearchResult) => {
    Keyboard.dismiss(); // Hide the keyboard
    setSearchText(''); // Clear search text
    setSearchResults([]); // Hide search results

    try {
      // Call the API to add the selected product to the list
      await productAPI.addProductToList(listId, product.id);
    } catch (error) {
      Alert.alert("Error", "Could not add item to the list.");
    }
  };

  const handleUpdateList = () => navigation.navigate('EditListScreen', { listId });
  
  if (isLoading && !list) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={styles.centered}><Text style={styles.errorText}>{error}</Text></View>;
  if (!list) return <View style={styles.centered}><Text>List not found.</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.listName}>{list.name}</Text>
          <Text style={styles.listDescription}>{list.description || 'No description provided.'}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={handleUpdateList} style={styles.actionButton}><Ionicons name="pencil-outline" size={24} color="#007AFF" /></Pressable>
        </View>
      </View>
      <View style={styles.addForm}>
        <TextInput style={styles.input} placeholder="Search for a product to add..." value={searchText} onChangeText={setSearchText} />
        {isSearching && <ActivityIndicator style={{ marginLeft: 10 }} />}
      </View>
      {searchText.length > 1 ? (
        <FlatList data={searchResults} renderItem={({ item }) => (<SearchResultItem item={item} onPress={() => handleSelectSearchResult(item)} />)} keyExtractor={(item) => item.id.toString()} style={styles.searchResultsContainer} keyboardShouldPersistTaps="handled" />
      ) : (
        <SectionList
          sections={itemSections}
          keyExtractor={(item, index) => item.id.toString() + index}
          renderItem={({ item }) => (
            <ListItemRow
              item={item}
              onToggleChecked={() => {}}
              onDelete={() => {}}
              onUpdateQuantity={() => {}}
              onViewInfo={() => {}}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Your list is empty.</Text>
            </View>
          }
          stickySectionHeadersEnabled
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', fontSize: 16 },
  header: { backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#ddd', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTextContainer: { flex: 1 },
  listName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  listDescription: { fontSize: 16, color: '#666' },
  headerActions: { flexDirection: 'row' },
  actionButton: { padding: 5 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', backgroundColor: '#f0f0f0', paddingVertical: 8, paddingHorizontal: 15, color: '#333' },
  addForm: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd', alignItems: 'center' },
  input: { flex: 1, height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#fff' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#888' },
  searchResultsContainer: { flex: 1 },
});
