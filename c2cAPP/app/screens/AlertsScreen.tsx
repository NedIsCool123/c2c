import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Image,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import Icon from 'react-native-vector-icons/Ionicons';

type AlertItem = {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  level: 'low' | 'medium' | 'high';
};

const AlertsScreen = () => {
  const navigation = useNavigation();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newAlert, setNewAlert] = useState({ title: '', description: '', level: 'medium' });

  useEffect(() => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (currentUser) {
      const checkAdminStatus = async () => {
        const adminDoc = await getDoc(doc(FIREBASE_DB, 'admins', currentUser.uid));
        if (adminDoc.exists() && adminDoc.data()?.role === 'admin') {
          setIsAdmin(true);
        }
      };
      checkAdminStatus();
    }

    const fetchAlerts = async () => {
      try {
        const alertsRef = collection(FIREBASE_DB, 'alerts');
        const q = query(alertsRef);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const alertsList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as AlertItem[];
          setAlerts(alertsList);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };

    fetchAlerts();
  }, []);

  const handleAddAlert = async () => {
    try {
      await addDoc(collection(FIREBASE_DB, 'alerts'), {
        ...newAlert,
        createdAt: Date.now(),
      });
      setModalVisible(false);
      setNewAlert({ title: '', description: '', level: 'medium' });
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this alert?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(FIREBASE_DB, 'alerts', alertId));
            } catch (e) {
              console.error('Error deleting document: ', e);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  const renderAlert = ({ item }: { item: AlertItem }) => (
    <View style={styles.alertCard}>
      <Text style={styles.alertTitle}>{item.title}</Text>
      <Text style={styles.alertDescription}>{item.description}</Text>
      <Text style={[styles.alertLevel, styles[item.level]]}>{item.level.toUpperCase()}</Text>
      {isAdmin && (
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteAlert(item.id)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setNewAlert({ title: '', description: '', level: 'medium' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'<Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Alerts</Text>
          {isAdmin && (
            <TouchableOpacity style={styles.addButton} onPress={openModal}>
              <Icon name="add-circle-outline" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {alerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image source={require('../../assets/alert.png')} style={styles.emptyImage} />
            <Text style={styles.emptyHeaderText}>No Current Alerts</Text>
            <Text style={styles.emptyDescriptionText}>Alerts will be posted here, none currently available. Turn on notifications in order to not miss any alerts.</Text>
            <TouchableOpacity style={styles.notifyButton} onPress={openSettings}>
              <Text style={styles.notifyButtonText}>GET NOTIFIED</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList data={alerts} renderItem={renderAlert} keyExtractor={(item) => item.id} contentContainerStyle={styles.listContainer} />
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalView}>
                  <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                    <Icon name="close" size={24} color="black" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Add New Alert</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Title"
                    value={newAlert.title}
                    onChangeText={(text) => setNewAlert({ ...newAlert, title: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Description"
                    value={newAlert.description}
                    onChangeText={(text) => setNewAlert({ ...newAlert, description: text })}
                  />
                  <View style={styles.buttonGroup}>
                    {['low', 'medium', 'high'].map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.levelButton,
                          newAlert.level === level && styles.selectedLevelButton,
                        ]}
                        onPress={() => setNewAlert({ ...newAlert, level })}
                      >
                        <Text
                          style={[
                            styles.levelButtonText,
                            newAlert.level === level && styles.selectedLevelButtonText,
                          ]}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity style={styles.modalButton} onPress={handleAddAlert}>
                    <Text style={styles.modalButtonText}>Create Alert</Text>
                  </TouchableOpacity>
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
    backgroundColor: '#633393',  // Purple background
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  header: {
    backgroundColor: '#633393',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 16,
  },
  listContainer: {
    padding: 16,
  },
  alertCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#633393',
  },
  alertDescription: {
    fontSize: 16,
    color: '#666',
  },
  alertLevel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  low: {
    color: 'green',
  },
  medium: {
    color: '#ff9800',
  },
  high: {
    color: 'red',
  },
  deleteButton: {
    backgroundColor: 'red',
    borderRadius: 5,
    marginTop: 10,
    padding: 5,
    alignItems: 'center',
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
    borderRadius: 5,
    padding: 10,
    width: '80%',
    alignItems: 'center',
  },
  notifyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: '#e0e0e0',  // Slightly lighter background color
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
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
    marginBottom: 20,
    color: '#633393',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 5,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  levelButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  selectedLevelButton: {
    backgroundColor: '#633393',
  },
  levelButtonText: {
    color: '#666',
  },
  selectedLevelButtonText: {
    color: 'white',
  },
  modalButton: {
    backgroundColor: '#633393',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AlertsScreen;