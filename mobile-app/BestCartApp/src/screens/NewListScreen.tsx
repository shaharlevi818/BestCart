import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, Button, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { addListToDB } from '../data/mockData'; // Import our "add" function
import { ShoppingList } from '../types';

type NewListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewListModal'>;

export default function NewListScreen() {
  const navigation = useNavigation<NewListScreenNavigationProp>();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isTemplate, setIsTemplate] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'List name is required.');
      return;
    }

    // --- SIMULATE API CALL ---
    // 1. Create a new list object with a unique ID and current date
    const newList: ShoppingList = {
      id: Date.now(), // Use timestamp for a unique mock ID
      user_id: 2, // Pretend we are 'Bob'
      name: name.trim(),
      description: description.trim() || null,
      is_template: isTemplate ? 1 : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 2. Add it to our mock database
    addListToDB(newList);
    console.log("New list created:", newList);

    // 3. Navigate to the detail screen for the new list, replacing the modal
    //    This is how we "hold the list's ID" for the next API calls.
    navigation.replace('ListDetailScreen', {
      listId: newList.id,
    });
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
        style={[styles.input, styles.multilineInput]}
        value={description}
        onChangeText={setDescription}
        placeholder="e.g., Stuff for the week"
        multiline
      />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Save as a Template?</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isTemplate ? "#f5dd4b" : "#f4f3f4"}
          onValueChange={setIsTemplate}
          value={isTemplate}
        />
      </View>
      
      <Button title="Save List" onPress={handleSave} />
      {Platform.OS === 'ios' && <Button title="Cancel" onPress={() => navigation.goBack()} color="red" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    marginBottom: 20,
  },
  multilineInput: { height: 100, textAlignVertical: 'top' },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
});