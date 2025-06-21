// src/components/SearchResultItem.tsx


import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ProductSearchResult } from '../types';

interface SearchResultItemProps {
  item: ProductSearchResult;
  onPress: () => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ item, onPress }) => {
  const getAvailabilityColor = () => {
    if (item.availability.isAtFavoriteStore) {
      return '#4CAF50'; // Green for favorite store
    }
    if (item.availability.otherStoreCount > 0) {
      return '#9E9E9E'; // Gray for other stores
    }
    return 'transparent'; // No dot if not available
  };

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.manufacturer}>{item.manufacturer || 'Generic'}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>
          {item.displayPrice ? `₪${item.displayPrice}` : 'N/A'}
        </Text>
        <Text style={styles.priceSource}>
          {item.priceSource === 'favorite_store' ? 'Favorite' : 'Avg'}
        </Text>
      </View>
      <View style={[styles.availabilityDot, { backgroundColor: getAvailabilityColor() }]} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  manufacturer: {
    fontSize: 12,
    color: '#888',
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginHorizontal: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceSource: {
    fontSize: 10,
    color: '#888',
  },
  availabilityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default SearchResultItem;
