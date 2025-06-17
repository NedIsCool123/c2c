import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Modal,
  SafeAreaView,
  Alert,
  Linking,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { collection, query, orderBy, onSnapshot, addDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { Swipeable } from 'react-native-gesture-handler';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';

type ItemNeed = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: number;
  createdBy: string;
};

const ItemNeeds = () => {
  const navigation = useNavigation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState<ItemNeed[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (currentUser) {
      const checkAdminStatus = async () => {
        const adminRef = doc(FIREBASE_DB, 'admins', currentUser.uid);
        const adminDoc = await getDoc(adminRef);
        setIsAdmin(adminDoc.exists());
      };
      checkAdminStatus();
    }

    const itemsRef = collection(FIREBASE_DB, 'itemNeeds');
    const q = query(itemsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const itemsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ItemNeed[];
      setItems(itemsList);
    });

    return () => unsubscribe();
  }, []);

  const addItem = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Error', 'Title cannot be empty');
      return;
    }
    if (!newDescription.trim()) {
      Alert.alert('Error', 'Description cannot be empty');
      return;
    }

    try {
      const currentUser = FIREBASE_AUTH.currentUser;
      if (!currentUser || !isAdmin) {
        alert('Only admins can add items');
        return;
      }

      await addDoc(collection(FIREBASE_DB, 'itemNeeds'), {
        title: newTitle,
        description: newDescription,
        imageUrl: newImageUrl || '', // Image is optional
        createdAt: Date.now(),
        createdBy: currentUser.uid,
      });

      setNewTitle('');
      setNewDescription('');
      setNewImageUrl('');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(FIREBASE_DB, 'itemNeeds', id));
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const pickImageFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setNewImageUrl(result.assets[0].uri);
    }
  };

  const renderRightActions = (id: string) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => deleteItem(id)}>
      <Text style={styles.deleteButtonText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: ItemNeed }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <View style={styles.itemCard}>
        {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.itemImage} /> : null}
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
        </View>
      </View>
    </Swipeable>
  );

  const handleGetNotified = () => {
    Linking.openSettings();
  };

  const closeModal = () => {
    setShowAddModal(false);
    setNewTitle('');
    setNewDescription('');
    setNewImageUrl('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-back" size={24} color="white" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Current Item Needs</Text>
          {isAdmin && (
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
              <Icon name="add-circle-outline" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image source={require('../../assets/shirt.png')} style={styles.emptyImage} />
            <Text style={styles.emptyHeaderText}>No Current Item Needs</Text>
            <Text style={styles.emptyDescriptionText}>
              Current item needs will be posted here. This page consists of the current items in which our organization encourages you to donate the most. This page changes, so make sure to check it!
            </Text>
            <TouchableOpacity style={styles.notifyButton} onPress={handleGetNotified}>
              <Text style={styles.notifyButtonText}>GET NOTIFIED</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList data={items} renderItem={renderItem} keyExtractor={(item) => item.id} contentContainerStyle={styles.listContainer} />
        )}

        <Modal visible={showAddModal} animationType="slide" transparent={true}>
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                    <Icon name="close" size={24} color="black" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Add New Item Need</Text>
                  <TextInput style={styles.input} placeholder="Title" value={newTitle} onChangeText={setNewTitle} />
                  <TextInput
                    style={[styles.input, styles.descriptionInput]}
                    placeholder="Description"
                    value={newDescription}
                    onChangeText={setNewDescription}
                    multiline
                  />
                  <TouchableOpacity style={styles.imageButton} onPress={pickImageFromLibrary}>
                    <Text style={styles.imageButtonText}>Choose from Library</Text>
                  </TouchableOpacity>
                  {newImageUrl ? <Image source={{ uri: newImageUrl }} style={styles.previewImage} /> : null}
                  <View style={styles.modalButtons}>
                    <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={closeModal}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalButton, styles.addItemButton]} onPress={addItem}>
                      <Text style={styles.addItemButtonText}>Add Item</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#633393',
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  header: {
    backgroundColor: '#633393',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 0,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginVertical: 16,
    marginRight: 50,
  },
  addButton: {
    position: 'absolute',
    right: 16,
  },
  listContainer: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  itemContent: {
    padding: 16,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#633393',
  },
  itemDescription: {
    fontSize: 16,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  emptyHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#633393',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescriptionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  notifyButton: {
    backgroundColor: '#633393',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  notifyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#633393',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageButton: {
    backgroundColor: '#633393',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  imageButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginVertical: 10,
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f4f4f4',
    borderWidth: 1,
    borderColor: '#633393',
  },
  addItemButton: {
    backgroundColor: '#633393',
  },
  cancelButtonText: {
    color: '#633393',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  addItemButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ItemNeeds;