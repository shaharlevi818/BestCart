import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ShoppingList } from '../types'; // <-- IMPORT FROM NEW LOCATION
import Ionicons from '@expo/vector-icons/Ionicons';

interface ShoppingListItemProps {
  item: ShoppingList;
  onPress: () => void;
  onDelete: () => void;
  onEdit?: () => void; // Optional edit function
}

const ShoppingListItem: React.FC<ShoppingListItemProps> = ({ item, onPress, onDelete, onEdit }) => {
  
  // Function to format the date string into something more readable
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Pressable style={styles.container} onPress={onPress}>
      {/* Top row for Name and Action Icons */}
      <View style={styles.topRow}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.actionsContainer}>
          <Pressable onPress={onEdit} style={styles.actionButton}>
            <Ionicons name="pencil-outline" size={22} color="#007AFF" />
          </Pressable>
          <Pressable onPress={onDelete} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={22} color="tomato" />
          </Pressable>
        </View>
      </View>

      {/* Description and Date */}
      <Text style={styles.description}>{item.description || 'No description'}</Text>
      <Text style={styles.date}>Last updated: {formatDate(item.updated_at)}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // Shadow for Android
    elevation: 5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1, // Allow name to take up available space
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 15,
    padding: 5, // Makes the touch area larger
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default ShoppingListItem;
