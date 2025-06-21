// src/components/ListItemRow.tsx

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DisplayListItem } from '../types';

interface ListItemRowProps {
  item: DisplayListItem;
  onDelete: (itemId: number) => void;
  onToggleChecked: () => void;
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
  onViewInfo: (productId: number) => void;
}

const ListItemRow: React.FC<ListItemRowProps> = ({ item, onDelete, onUpdateQuantity, onViewInfo }) => {
  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    } else {
        // If quantity is 1, decrementing should delete the item
        onDelete(item.id);
    }
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  return (
    <View style={styles.container}>
      {/* Main Info Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.itemManufacturer}>{'Generic'}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
            {item.notes || 'No notes for this item.'}
        </Text>
      </View>

      {/* Price & Quantity Section */}
      <View style={styles.controlsContainer}>
        <Text style={styles.price}>₪--.--</Text>
        <View style={styles.quantityControl}>
          <Pressable onPress={handleDecrement} style={styles.quantityButton}>
            <Ionicons name="remove-circle-outline" size={30} color="#E53935" />
          </Pressable>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <Pressable onPress={handleIncrement} style={styles.quantityButton}>
            <Ionicons name="add-circle" size={30} color="#43A047" />
          </Pressable>
        </View>
      </View>

      {/* Action Buttons on the side */}
      <View style={styles.actionsContainer}>
          <Pressable onPress={() => onViewInfo(item.product_id)} style={styles.actionButton}>
              <Ionicons name="information-circle-outline" size={26} color="#007AFF" />
          </Pressable>
          <Pressable onPress={() => onDelete(item.id)} style={styles.actionButton}>
              <Ionicons name="trash-bin" size={24} color="tomato" />
          </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoContainer: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  itemManufacturer: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
  },
  controlsContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: 4,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  actionsContainer: {
    justifyContent: 'space-around',
    height: '100%',
  },
  actionButton: {
    padding: 8,
  }
});

export default ListItemRow;



// import React from 'react';
// import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import { DisplayListItem } from '../types';

// interface ListItemRowProps {
//   item: DisplayListItem;
//   onToggleChecked: (itemId: number, isChecked: boolean) => void;
//   onDelete: (itemId: number) => void;
// }

// const ListItemRow: React.FC<ListItemRowProps> = ({ item, onToggleChecked, onDelete }) => {
//   const isChecked = item.is_checked;

//   return (
//     <View style={styles.container}>
//       <Switch
//         value={isChecked}
//         onValueChange={(newValue) => onToggleChecked(item.id, newValue)}
//       />
//       <View style={styles.itemDetails}>
//         <Text style={[styles.itemName, isChecked && styles.itemNameChecked]}>
//           {item.productName}
//         </Text>
//         <Text style={styles.itemMeta}>
//           {item.quantity} {item.units}
//         </Text>
//         {item.notes && (
//             <Text style={styles.itemNotes}>
//                 Notes: {item.notes}
//             </Text>
//         )}
//       </View>
//       <Pressable onPress={() => onDelete(item.id)} style={styles.deleteButton}>
//         <Ionicons name="trash-bin-outline" size={22} color="tomato" />
//       </Pressable>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//   },
//   itemDetails: {
//     flex: 1,
//     marginLeft: 15,
//   },
//   itemName: {
//     fontSize: 18,
//     fontWeight: '500',
//   },
//   itemNameChecked: {
//     textDecorationLine: 'line-through',
//     color: '#999',
//   },
//   itemMeta: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 2,
//   },
//   itemNotes: {
//     fontSize: 14,
//     color: '#007AFF',
//     fontStyle: 'italic',
//     marginTop: 4,
//   },
//   deleteButton: {
//     padding: 5,
//   },
// });

// export default ListItemRow;