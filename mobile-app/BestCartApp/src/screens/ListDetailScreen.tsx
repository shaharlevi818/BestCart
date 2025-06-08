// /src/screens/ListDetailScreen.tsx

import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, TextInput, Button, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ALL_SHOPPING_LISTS, ALL_PRODUCTS, ALL_LIST_ITEMS } from '../data/mockData';
import { DisplayListItem, ListItem } from '../types';
import ListItemRow from '../components/ListItemRow';

type ListDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'ListDetailScreen'>;

export default function ListDetailScreen({ route, navigation }: ListDetailScreenProps) {
  const { listId } = route.params;
  const list = ALL_SHOPPING_LISTS.find(item => item.id === listId);

  const [itemSections, setItemSections] = useState<{ title: string; data: DisplayListItem[] }[]>([]);
  const [newProductName, setNewProductName] = useState('');

  const groupItemsByDepartment = (items: DisplayListItem[]) => {
    if (items.length === 0) return [];
    
    const grouped = items.reduce((acc, item) => {
      const department = item.department_grouping || item.department || 'Other';
      if (!acc[department]) acc[department] = [];
      acc[department].push(item);
      return acc;
    }, {} as Record<string, DisplayListItem[]>);

    return Object.keys(grouped)
      .map(department => ({ title: department, data: grouped[department] }))
      .sort((a, b) => a.title.localeCompare(b.title)); // Sort sections alphabetically
  };

  useEffect(() => {
    const itemsForThisList = ALL_LIST_ITEMS.filter(item => item.shopping_list_id === listId);
    const displayItems: DisplayListItem[] = itemsForThisList.map(item => {
      const product = ALL_PRODUCTS.find(p => p.id === item.product_id);
      return { ...item, productName: product?.name || 'Unknown', department: product?.canonical_department || 'Other' };
    });
    setItemSections(groupItemsByDepartment(displayItems));
  }, [listId]);

  useLayoutEffect(() => {
    if (list) navigation.setOptions({ title: list.name });
  }, [navigation, list]);

  const handleAddItem = () => {
    const productName = newProductName.trim();
    if (!productName) return;

    let product = ALL_PRODUCTS.find(p => p.name.toLowerCase() === productName.toLowerCase());
    if (!product) {
        product = { 
            id: Date.now(), 
            name: productName,
            description: null, // <-- Add this line
            manufacturer: null, 
            canonical_department: 'Other', 
            default_units: 'Unit' 
        };
        ALL_PRODUCTS.push(product);
    }
    
    const newListItem: ListItem = {
      id: Date.now() + 1,
      shopping_list_id: listId,
      product_id: product.id,
      quantity: 1,
      units: product.default_units,
      is_checked: false,
      notes: null,
      department_grouping: null,
    };
    ALL_LIST_ITEMS.push(newListItem);

    const currentItems = itemSections.flatMap(section => section.data);
    const newDisplayItem: DisplayListItem = { ...newListItem, productName: product.name, department: product.canonical_department || 'Other' };
    setItemSections(groupItemsByDepartment([...currentItems, newDisplayItem]));
    setNewProductName('');
  };
  
  const handleToggleChecked = (itemId: number, isChecked: boolean) => {
      const newSections = itemSections.map(section => ({
          ...section,
          data: section.data.map(item => item.id === itemId ? { ...item, is_checked: isChecked } : item),
      }));
      setItemSections(newSections);
  };
  
  const handleDeleteItem = (itemId: number) => {
    const indexToDelete = ALL_LIST_ITEMS.findIndex(item => item.id === itemId);
    if (indexToDelete > -1) {
      ALL_LIST_ITEMS.splice(indexToDelete, 1);
    }
      const newSections = itemSections.map(section => ({
          ...section,
          data: section.data.filter(item => item.id !== itemId),
      })).filter(section => section.data.length > 0);
      setItemSections(newSections);
  };

  if (!list) return <View style={styles.container}><Text>List not found!</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.addForm}>
        <TextInput style={styles.input} placeholder="Add a product..." value={newProductName} onChangeText={setNewProductName} onSubmitEditing={handleAddItem} />
        <Button title="Add" onPress={handleAddItem} />
      </View>

      <SectionList
        sections={itemSections}
        keyExtractor={(item, index) => item.id.toString() + index}
        renderItem={({ item }) => (
            <ListItemRow item={item} onToggleChecked={handleToggleChecked} onDelete={handleDeleteItem} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>Your list is empty.</Text></View>}
        stickySectionHeadersEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  addForm: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  input: { flex: 1, height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginRight: 10, backgroundColor: '#fff' },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', backgroundColor: '#f0f0f0', paddingVertical: 8, paddingHorizontal: 15, color: '#333' },
  emptyContainer: { marginTop: 50, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#888' },
});