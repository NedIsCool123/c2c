import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';

const TestAlert = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const currentUser = FIREBASE_AUTH.currentUser;
      if (currentUser) {
        const adminRef = doc(FIREBASE_DB, 'admins', currentUser.uid);
        const adminDoc = await getDoc(adminRef);
        setIsAdmin(adminDoc.exists());
      }
    };
    checkAdminStatus();
  }, []);

  const addTestAlert = async () => {
    try {
      const currentUser = FIREBASE_AUTH.currentUser;
      if (!currentUser) {
        alert('You must be logged in to create alerts');
        return;
      }

      if (!isAdmin) {
        alert('Only admins can create alerts');
        return;
      }

      const alertData = {
        title: title || 'Test Alert',
        message: message || 'This is a test alert message',
        priority: priority,
        timestamp: Date.now(),
        read: false,
        createdBy: currentUser.uid
      };

      await addDoc(collection(FIREBASE_DB, 'alerts'), alertData);
      setTitle('');
      setMessage('');
      alert('Test alert added successfully!');
    } catch (error) {
      console.error('Error adding test alert:', error);
      alert('Failed to add test alert. Please ensure you are logged in and have proper permissions.');
    }
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Only admins can create alerts</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Test Alert</Text>
      <TextInput
        style={styles.input}
        placeholder="Alert Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.messageInput]}
        placeholder="Alert Message"
        value={message}
        onChangeText={setMessage}
        multiline
      />
      <View style={styles.priorityContainer}>
        <TouchableOpacity
          style={[styles.priorityButton, priority === 'high' && styles.selectedPriority]}
          onPress={() => setPriority('high')}
        >
          <Text style={[styles.priorityText, priority === 'high' && styles.selectedPriorityText]}>High</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.priorityButton, priority === 'medium' && styles.selectedPriority]}
          onPress={() => setPriority('medium')}
        >
          <Text style={[styles.priorityText, priority === 'medium' && styles.selectedPriorityText]}>Medium</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.priorityButton, priority === 'low' && styles.selectedPriority]}
          onPress={() => setPriority('low')}
        >
          <Text style={[styles.priorityText, priority === 'low' && styles.selectedPriorityText]}>Low</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={addTestAlert}>
        <Text style={styles.addButtonText}>Add Test Alert</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#633393',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  priorityButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedPriority: {
    backgroundColor: '#633393',
  },
  priorityText: {
    color: '#000',
  },
  selectedPriorityText: {
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#633393',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TestAlert;