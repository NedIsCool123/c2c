import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Button, Alert } from 'react-native';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { addDoc, collection } from 'firebase/firestore';

const AdminPanel = () => {
  const [event, setEvent] = useState({
    date: '',
    time: '',
    title: '',
    description: '',
    location: '',
  });

  const handleAddEvent = async () => {
    if (!event.date || !event.time || !event.title) {
      Alert.alert('Error', 'Date, Time, and Title are required.');
      return;
    }

    try {
      await addDoc(collection(FIREBASE_DB, 'events'), {
        Date: event.date,
        Time: event.time,
        Title: event.title,
        Description: event.description,
        Location: event.location,
      });

      Alert.alert('Success', 'Event added successfully!');
      setEvent({ date: '', time: '', title: '', description: '', location: '' });
    } catch (error) {
      console.error('Error adding event: ', error);
      Alert.alert('Error', 'Failed to add event. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Date (YYYY-MM-DD)"
        value={event.date}
        onChangeText={(text) => setEvent({ ...event, date: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Time (HH:MM AM/PM)"
        value={event.time}
        onChangeText={(text) => setEvent({ ...event, time: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Title"
        value={event.title}
        onChangeText={(text) => setEvent({ ...event, title: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Description"
        value={event.description}
        onChangeText={(text) => setEvent({ ...event, description: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Location"
        value={event.location}
        onChangeText={(text) => setEvent({ ...event, location: text })}
        style={styles.input}
      />
      <Button title="Add Event" onPress={handleAddEvent} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default AdminPanel;