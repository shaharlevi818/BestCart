import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ShoppingList } from '../types'; // <-- IMPORT FROM NEW LOCATION

interface ShoppingListItemProps {
  item: ShoppingList;
  onPress: () => void;
}

// The rest of the component remains the same...
const ShoppingListItem: React.FC<ShoppingListItemProps> = ({ item, onPress }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const truncateDescription = (desc: string | null, maxLength = 50) => {
    if (!desc) return '';
    if (desc.length <= maxLength) return desc;
    return `${desc.substring(0, maxLength)}...`;
  };

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.description}>{truncateDescription(item.description)}</Text>
      <Text style={styles.date}>Last updated: {formatDate(item.updated_at)}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // ... your styles here
  container: { backgroundColor: '#fff', padding: 15, marginVertical: 8, marginHorizontal: 16, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  description: { fontSize: 14, color: '#666', marginBottom: 10 },
  date: { fontSize: 12, color: '#999', textAlign: 'right' },
});

export default ShoppingListItem;