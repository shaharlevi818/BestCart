import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, Button, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { shoppingListAPI } from '../api/shoppingListAPIService'; // Import your API service

type NewListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewListModal'>;

export default function NewListScreen() {
  const navigation = useNavigation<NewListScreenNavigationProp>();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isTemplate, setIsTemplate] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'List name is required.');
      return;
    }

    // --- FIX: Create an object with only the fields the server expects ---
    const newListData = {
      name: name.trim(),
      description: description.trim() || null,
      is_template: isTemplate,
    };

    console.log("Sending this data to server:", newListData); // For debugging

    try {
      // Call the API to create the list
      const newlyCreatedList = await shoppingListAPI.create(newListData);

      console.log("List created successfully via API, ID:", newlyCreatedList.id);

      // Navigate to the detail screen with the ID from the server response
      navigation.replace('ListDetailScreen', {
        listId: newlyCreatedList.id,
      });

    } catch (error: any) {
        console.error("Error creating new list:", error);
        if (error.response && error.response.data) {
            // If the server sends back a specific error message, show it
            Alert.alert("Error", error.response.data.message || "Could not create the list.");
        } else {
            // Fallback for generic network errors
            Alert.alert("Error", "An unexpected error occurred. Please try again.");
        }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>List Name (Required)</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g., Weekly Groceries"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, {height: 100, textAlignVertical: 'top'}]}
        value={description}
        onChangeText={setDescription}
        placeholder="e.g., Stuff for the week"
        multiline
      />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Save as a Template?</Text>
        <Switch
          value={isTemplate}
          onValueChange={setIsTemplate}
        />
      </View>
      
      <Button title="Save List" onPress={handleSave} />
      {Platform.OS === 'ios' && <Button title="Cancel" onPress={() => navigation.goBack()} color="red" />}
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
    input: { backgroundColor: 'white', padding: 10, borderRadius: 5, borderWidth: 1, borderColor: '#ddd', marginBottom: 20 },
    switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
});