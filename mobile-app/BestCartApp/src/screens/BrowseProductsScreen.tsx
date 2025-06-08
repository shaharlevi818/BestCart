// src/screens/BrowseProductsScreen.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BrowseProductsScreen() {
  return (
    <View style={styles.container}>
      <Text>BrowseProductsScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});