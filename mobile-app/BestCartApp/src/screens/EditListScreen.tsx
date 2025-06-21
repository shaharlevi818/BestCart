// src/screens/EditListScreen.tsx

// src/screens/EditListScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, Button, Alert, ActivityIndicator, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { shoppingListAPI } from '../api/shoppingListAPIService';

type EditListScreenProps = NativeStackScreenProps<RootStackParamList, 'EditListScreen'>;

export default function EditListScreen({ route, navigation }: EditListScreenProps) {
  const { listId } = route.params;

  // State for form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isTemplate, setIsTemplate] = useState(false);
  
  // State for loading
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch the existing list data when the screen loads
  useEffect(() => {
    const fetchList = async () => {
      try {
        const listData = await shoppingListAPI.getById(listId);
        if (listData) {
          setName(listData.name);
          setDescription(listData.description || '');
          setIsTemplate(listData.is_template);
        }
      } catch (error) {
        Alert.alert("Error", "Could not load list data.");
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };
    fetchList();
  }, [listId, navigation]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'List name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedData = {
        name: name.trim(),
        description: description.trim() || null,
        is_template: isTemplate,
      };
      await shoppingListAPI.update(listId, updatedData);
      navigation.goBack(); // Go back to the previous screen on success
    } catch (error) {
      Alert.alert("Error", "Failed to update the list.");
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>List Name (Required)</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} value={description} onChangeText={setDescription} multiline />
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Is a Template?</Text>
        <Switch value={isTemplate} onValueChange={setIsTemplate} />
      </View>
      <Button title={isSaving ? "Saving..." : "Save Changes"} onPress={handleSave} disabled={isSaving} />
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
    input: { backgroundColor: 'white', padding: 10, borderRadius: 5, borderWidth: 1, borderColor: '#ddd', marginBottom: 20 },
    switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
});
// This screen allows users to edit an existing shopping list.
// It fetches the existing list data, allows users to update the name, description, and template status,
// and saves the changes back to the server.
// It also handles loading states and validation for required fields.