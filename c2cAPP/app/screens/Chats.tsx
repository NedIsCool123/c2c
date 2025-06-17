import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Button, Image, SafeAreaView, Modal, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { collection, getDocs, addDoc, query, where, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { RootStackParamList } from '../../navigation/RootStackParamList';
import { NavigationProp } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import Swipeable from 'react-native-gesture-handler/Swipeable';

interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  names: { [key: string]: string };
}

interface User {
  id: string;
  username: string;
}

const Chats: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [newChatParticipant, setNewChatParticipant] = useState('');
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const currentUser = getAuth().currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const chatsQuery = query(collection(FIREBASE_DB, 'chats'));
    const unsubscribe = onSnapshot(chatsQuery, async (querySnapshot) => {
      const chatsData: Chat[] = [];
      for (const doc of querySnapshot.docs) {
        const chatData = doc.data();
        if (chatData.participants.includes(currentUser.displayName || currentUser.email || 'Anonymous')) {
          const chat: Chat = {
            id: doc.id,
            participants: chatData.participants || [],
            lastMessage: chatData.lastMessage || '',
            names: chatData.names || {},
          };
          const messagesSnapshot = await getDocs(collection(FIREBASE_DB, 'chats', doc.id, 'messages'));
          if (!messagesSnapshot.empty) {
            chatsData.push(chat);
          }
        }
      }
      setChats(chatsData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleSearchChange = async (text: string) => {
    setNewChatParticipant(text);
    if (text.length > 1) {
      const lowercasedText = text.toLowerCase();
      const usersQuery = query(collection(FIREBASE_DB, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs
        .map(doc => ({
          id: doc.id,
          username: doc.data().username,
        }))
        .filter(user => 
          user.username.toLowerCase().includes(lowercasedText) && 
          user.username !== (currentUser?.displayName || currentUser?.email)
        ) as User[];
      setSuggestions(usersData);
    } else {
      setSuggestions([]);
    }
  };

  const handleUserSelect = (user: User) => {
    if (!selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(prevSelectedUsers => [...prevSelectedUsers, user]);
    }
    setNewChatParticipant('');
    setSuggestions([]);
  };

  const handleUserRemove = (userId: string) => {
    setSelectedUsers(prevSelectedUsers => prevSelectedUsers.filter(user => user.id !== userId));
  };

  const createNewChat = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }
    setError('');

    const currentUserName = currentUser?.displayName || currentUser?.email || 'Anonymous';
    const participants = [...selectedUsers.map(user => user.username), currentUserName];
    const chatNames: { [key: string]: string } = {};

    // Set chat names for each participant
    participants.forEach(participant => {
      const otherParticipants = participants.filter(p => p !== participant);
      chatNames[participant] = `Chat with ${otherParticipants.join(', ')}`;
    });

    const newChat = {
      participants,
      lastMessage: '',
      names: chatNames,
      createdAt: Date.now(),
    };

    try {
      const docRef = await addDoc(collection(FIREBASE_DB, 'chats'), newChat);
      setSelectedUsers([]);
      setModalVisible(false);
      navigation.navigate('Chat', { chatId: docRef.id });
    } catch (error) {
      console.error('Error creating chat:', error);
      setError('Failed to create chat. Please try again.');
    }
  };

  const getChatName = (chat: Chat) => {
    if (!currentUser) return 'Chat';
    
    const currentUserIdentifier = currentUser.displayName || currentUser.email || 'Anonymous';
    
    // If we have a stored name for this user, use it
    if (chat.names && chat.names[currentUserIdentifier]) {
      return chat.names[currentUserIdentifier];
    }
    
    // Fallback: generate name from participants
    const otherParticipants = chat.participants.filter(p => p !== currentUserIdentifier);
    return `Chat with ${otherParticipants.join(', ')}`;
  };

  const deleteChat = async (chatId: string) => {
    try {
      await deleteDoc(doc(FIREBASE_DB, 'chats', chatId));
      setChats(chats.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error('Error deleting chat:', error);
      Alert.alert('Error', 'Failed to delete chat. Please try again.');
    }
  };

  const renderRightActions = (progress: any, dragX: any, chatId: string) => {
    return (
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => {
          Alert.alert(
            'Delete Chat',
            'Are you sure you want to delete this chat?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Delete',
                onPress: () => deleteChat(chatId),
                style: 'destructive',
              },
            ]
          );
        }}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  const handleCloseModal = () => {
    setSelectedUsers([]);
    setNewChatParticipant('');
    setSuggestions([]);
    setModalVisible(false);
    setError('');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.topSection}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color="white" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Chats</Text>
      </SafeAreaView>
      <View style={styles.contentSection}>
        {chats.length > 0 ? (
          <FlatList
            data={chats}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item.id)}>
                <TouchableOpacity
                  style={styles.chatItem}
                  onPress={() => navigation.navigate('Chat', { chatId: item.id })}
                >
                  <Text style={styles.chatText}>{getChatName(item)}</Text>
                  <Text style={styles.lastMessage}>{item.lastMessage}</Text>
                </TouchableOpacity>
              </Swipeable>
            )}
          />
        ) : (
          <View style={styles.noMessagesContainer}>
            <Image source={require('../../assets/messages.png')} style={styles.noMessagesImage} />
            <Text style={styles.noMessagesHeader}>No Messages Yet</Text>
            <Text style={styles.noMessagesDescription}>
              Use the + icon to create group chats
              with friends and stay connected!
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Icon name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Create New Chat</Text>
            <TextInput
              style={styles.input}
              placeholder="Search users..."
              value={newChatParticipant}
              onChangeText={handleSearchChange}
            />
            {suggestions.length > 0 && (
              <Text style={styles.suggestionsTitle}>Suggested Users</Text>
            )}
            <ScrollView style={styles.suggestionsContainer}>
              {suggestions.map(suggestion => (
                <TouchableOpacity
                  key={suggestion.id}
                  style={styles.suggestionItem}
                  onPress={() => handleUserSelect(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion.username}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {selectedUsers.length > 0 && (
              <View style={styles.selectedUsersContainer}>
                <Text style={styles.selectedUsersTitle}>Selected Users:</Text>
                {selectedUsers.map(user => (
                  <View key={user.id} style={styles.selectedUserContainer}>
                    <Text style={styles.selectedUser}>{user.username}</Text>
                    <TouchableOpacity onPress={() => handleUserRemove(user.id)}>
                      <Icon name="remove-circle" size={24} color="red" />
                    </TouchableOpacity>
                  </View>
                ))}
                <Button title="Create Chat" onPress={createNewChat} />
              </View>
            )}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    backgroundColor: '#633393',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginVertical: 16,
    right: 45,
  },
  contentSection: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  chatItem: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chatText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  noMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noMessagesImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  noMessagesHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noMessagesDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  fab: {
    backgroundColor: '#633393',
    width: 56,
    height: 56,
    borderRadius: 28,
    position: 'absolute',
    bottom: 16,
    right: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  suggestionsContainer: {
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
  },
  selectedUsersContainer: {
    marginTop: 16,
  },
  selectedUsersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  selectedUserContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedUser: {
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Chats;