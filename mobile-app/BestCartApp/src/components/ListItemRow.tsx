import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DisplayListItem } from '../types';

interface ListItemRowProps {
  item: DisplayListItem;
  onToggleChecked: (itemId: number, isChecked: boolean) => void;
  onDelete: (itemId: number) => void;
}

const ListItemRow: React.FC<ListItemRowProps> = ({ item, onToggleChecked, onDelete }) => {
  const isChecked = item.is_checked;

  return (
    <View style={styles.container}>
      <Switch
        value={isChecked}
        onValueChange={(newValue) => onToggleChecked(item.id, newValue)}
      />
      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, isChecked && styles.itemNameChecked]}>
          {item.productName}
        </Text>
        <Text style={styles.itemMeta}>
          {item.quantity} {item.units}
        </Text>
        {item.notes && (
            <Text style={styles.itemNotes}>
                Notes: {item.notes}
            </Text>
        )}
      </View>
      <Pressable onPress={() => onDelete(item.id)} style={styles.deleteButton}>
        <Ionicons name="trash-bin-outline" size={22} color="tomato" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '500',
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  itemMeta: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemNotes: {
    fontSize: 14,
    color: '#007AFF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  deleteButton: {
    padding: 5,
  },
});

export default ListItemRow;