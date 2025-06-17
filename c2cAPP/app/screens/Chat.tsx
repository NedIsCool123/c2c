import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, Alert, Modal, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { RootStackParamList } from '../../navigation/RootStackParamList';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { BlurView } from 'expo-blur';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

interface ChatData {
  participants: string[];
  names: { [key: string]: string };
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const { chatId } = route.params;
  const currentUser = getAuth().currentUser;

  useEffect(() => {
    const fetchChatData = async () => {
      const chatDoc = await getDoc(doc(FIREBASE_DB, 'chats', chatId));
      if (chatDoc.exists()) {
        setChatData(chatDoc.data() as ChatData);
      }
    };

    fetchChatData();
  }, [chatId]);

  useEffect(() => {
    const messagesQuery = query(
      collection(FIREBASE_DB, 'chats', chatId, 'messages'),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const messagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [chatId]);

  const getChatTitle = () => {
    if (!chatData || !currentUser) return 'Chat';
    const currentUserIdentifier = currentUser.displayName || currentUser.email || 'Anonymous';
    return chatData.names[currentUserIdentifier] || 'Chat';
  };

  const sendMessage = async () => {
    if (!currentUser || !newMessage.trim()) return;

    const message = {
      sender: currentUser.displayName || currentUser.email || 'Anonymous',
      text: newMessage.trim(),
      timestamp: Date.now(),
    };

    try {
      await addDoc(collection(FIREBASE_DB, 'chats', chatId, 'messages'), message);
      await updateDoc(doc(FIREBASE_DB, 'chats', chatId), {
        lastMessage: newMessage.trim(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const updateMessage = async (message: Message) => {
    if (!currentUser || !message.id) return;

    try {
      await updateDoc(doc(FIREBASE_DB, 'chats', chatId, 'messages', message.id), {
        text: message.text,
      });
      setEditingMessage(null);
    } catch (error) {
      console.error('Error updating message:', error);
      Alert.alert('Error', 'Failed to update message. Please try again.');
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!currentUser) return;

    try {
      await deleteDoc(doc(FIREBASE_DB, 'chats', chatId, 'messages', messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      Alert.alert('Error', 'Failed to delete message. Please try again.');
    }
  };

  const handleLongPress = (message: Message) => {
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    if (now - message.timestamp <= tenMinutes && 
        message.sender === (currentUser?.displayName || currentUser?.email)) {
      Alert.alert(
        'Message Options',
        'What would you like to do?',
        [
          {
            text: 'Edit',
            onPress: () => setEditingMessage(message),
          },
          {
            text: 'Delete',
            onPress: () => deleteMessage(message.id),
            style: 'destructive',
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const duration = moment.duration(moment().diff(moment(timestamp)));
    if (duration.asWeeks() >= 1) {
      return `${Math.floor(duration.asWeeks())}w`;
    } else if (duration.asDays() >= 1) {
      return `${Math.floor(duration.asDays())}d`;
    } else if (duration.asHours() >= 1) {
      return `${Math.floor(duration.asHours())}h`;
    } else {
      return `${Math.floor(duration.asMinutes())}m`;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.topSection}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>&lt;Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{getChatTitle()}</Text>
      </SafeAreaView>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onLongPress={() => handleLongPress(item)}
            delayLongPress={500}
          >
            <View style={[
              styles.messageContainer,
              item.sender === (currentUser?.displayName || currentUser?.email)
                ? styles.messageContainerRight
                : styles.messageContainerLeft
            ]}>
              <Text style={styles.messageInfo}>
                {item.sender} • {formatTimeAgo(item.timestamp)}
              </Text>
              <View style={[
                styles.messageBubble,
                item.sender === (currentUser?.displayName || currentUser?.email)
                  ? styles.messageBubbleRight
                  : styles.messageBubbleLeft
              ]}>
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {editingMessage && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={true}
          onRequestClose={() => setEditingMessage(null)}
        >
          <TouchableWithoutFeedback onPress={() => setEditingMessage(null)}>
            <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill}>
              <View style={styles.editingContainer}>
                <View style={styles.editingBox}>
                  <TextInput
                    style={styles.editingInput}
                    value={editingMessage.text}
                    onChangeText={(text) => setEditingMessage({ ...editingMessage, text })}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={() => updateMessage(editingMessage)}
                  >
                    <Text style={styles.updateButtonText}>Update</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Icon name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  topSection: {
    backgroundColor: '#633393',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  messageContainer: {
    margin: 8,
    maxWidth: '80%',
  },
  messageContainerRight: {
    alignSelf: 'flex-end',
  },
  messageContainerLeft: {
    alignSelf: 'flex-start',
  },
  messageInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  messageBubbleRight: {
    backgroundColor: '#633393',
  },
  messageBubbleLeft: {
    backgroundColor: '#e4e4e4',
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 12,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#633393',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  editingBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '90%',
  },
  editingInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  updateButton: {
    backgroundColor: '#633393',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Chat;
