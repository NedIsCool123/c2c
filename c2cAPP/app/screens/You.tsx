import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

const You = () => {
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (currentUser) {
      setUserEmail(currentUser.email || '');
      // Fetch current username
      const fetchUsername = async () => {
        const usersRef = collection(FIREBASE_DB, 'users');
        const q = query(usersRef, where('uid', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUsername(userData.username);
          setNewUsername(userData.username);
        }
      };
      fetchUsername();
    }
  }, []);

  const handleUsernameChange = async () => {
    if (!newUsername.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    const currentUser = FIREBASE_AUTH.currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    try {
      const normalizedNewUsername = newUsername.trim().toLowerCase();

      // Check if username is taken (case-insensitive)
      const usersRef = collection(FIREBASE_DB, 'users');
      const q = query(usersRef, where('username', '==', normalizedNewUsername));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty && querySnapshot.docs[0].data().uid !== currentUser.uid) {
        Alert.alert('Error', 'Username is already taken');
        return;
      }

      // Update username in users collection
      const userQuery = query(usersRef, where('uid', '==', currentUser.uid));
      const userDocs = await getDocs(userQuery);
      if (!userDocs.empty) {
        const userDoc = userDocs.docs[0];
        await updateDoc(doc(FIREBASE_DB, 'users', userDoc.id), {
          username: normalizedNewUsername,
        });
      }

      setUsername(normalizedNewUsername);
      setIsEditing(false);
      Alert.alert('Success', 'Username updated successfully');
    } catch (error) {
      console.error('Error updating username:', error);
      Alert.alert('Error', 'Failed to update username');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/c2c-logo.png')}
        style={styles.logo}
      />
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={require('../../assets/default-avatar.png')}
            style={styles.avatar}
            defaultSource={require('../../assets/default-avatar.png')}
          />
        </View>
        <Text style={styles.email}>{userEmail}</Text>
        <View style={styles.usernameContainer}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.usernameInput}
                value={newUsername}
                onChangeText={setNewUsername}
                placeholder="Enter new username"
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleUsernameChange}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setNewUsername(username);
                    setIsEditing(false);
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.displayContainer}>
              <Text style={styles.usernameText}>Username: {username}</Text>
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.buttonText}>Edit Username</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    paddingTop: 40,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  profileSection: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  usernameContainer: {
    width: '100%',
    alignItems: 'center',
  },
  editContainer: {
    width: '100%',
    alignItems: 'center',
  },
  displayContainer: {
    width: '100%',
    alignItems: 'center',
  },
  usernameInput: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  usernameText: {
    fontSize: 18,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#633393',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default You;