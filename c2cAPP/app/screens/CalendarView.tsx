import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  Text,
  StatusBar,
  SafeAreaView,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/RootStackParamList';
import Icon from 'react-native-vector-icons/Ionicons';

interface Event {
  id?: string;
  date: string;
  time: string;
  title: string;
  description?: string;
  location?: string;
}

interface DateObject {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

type CalendarViewNavigationProp = StackNavigationProp<RootStackParamList, 'CalendarView'>;

const CalendarView = () => {
  const [events, setEvents] = useState<{ [key: string]: Event[] }>({});
  const [markedDates, setMarkedDates] = useState<{ [key: string]: { customStyles: any } }>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState<Event>({
    date: '',
    time: '',
    title: '',
    description: '',
    location: '',
  });

  const auth = getAuth();
  const navigation = useNavigation<CalendarViewNavigationProp>();

  const fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(FIREBASE_DB, 'events'));
      let eventsData: { [key: string]: Event[] } = {};
      let marked: { [key: string]: { customStyles: any } } = {};

      querySnapshot.forEach((doc) => {
        const event = doc.data();
        if (!event.Date || !event.Time || !event.Title) return;

        const date = event.Date;
        const time = event.Time;
        const eventId = doc.id;

        if (!eventsData[date]) {
          eventsData[date] = [];
        }

        eventsData[date].push({
          id: eventId,
          date,
          time,
          title: event.Title,
          description: event.Description || '',
          location: event.Location || '',
        });

        marked[date] = {
          customStyles: {
            container: { backgroundColor: 'transparent' },
            text: { color: 'black', fontWeight: 'bold' },
            event: { backgroundColor: '#fcb800', padding: 4, borderRadius: 4 },
          },
        };
      });

      setEvents(eventsData);
      setMarkedDates(marked);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const checkAdmin = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const adminDoc = await getDoc(doc(FIREBASE_DB, 'admins', currentUser.uid));
        setIsAdmin(adminDoc.exists() && adminDoc.data()?.role === 'admin');
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    }
  };

  const adjustInputs = (): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(newEvent.date)) {
      try {
        const parsedDate = new Date(newEvent.date);
        const adjustedDate = parsedDate.toISOString().split('T')[0];
        setNewEvent((prev) => ({ ...prev, date: adjustedDate }));
      } catch (error) {
        Alert.alert(
          'Invalid Input',
          'The "Date" field is not valid. Please enter a valid date.\nExample: 2025-05-09'
        );
        return false;
      }
    }

    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
    if (!timeRegex.test(newEvent.time)) {
      const adjustedTime = newEvent.time.replace(/([a-zA-Z]+)$/g, ' $1').toUpperCase();
      if (timeRegex.test(adjustedTime)) {
        setNewEvent((prev) => ({ ...prev, time: adjustedTime }));
      } else {
        Alert.alert(
          'Invalid Input',
          'The "Time" field is not valid. Please enter a valid time.\nExample: 10:00 AM'
        );
        return false;
      }
    }

    if (!newEvent.title.trim()) {
      Alert.alert(
        'Invalid Input',
        'The "Title" field is required. Please enter a title for the event.\nExample: Community Cleanup'
      );
      return false;
    }

    return true;
  };

  const handleAddEvent = async () => {
    if (!adjustInputs()) return;

    try {
      await addDoc(collection(FIREBASE_DB, 'events'), {
        Date: newEvent.date,
        Time: newEvent.time,
        Title: newEvent.title,
        Description: newEvent.description || '',
        Location: newEvent.location || '',
        CreatedBy: 'Admin',
      });

      Alert.alert('Success', 'Event added successfully!');
      setModalVisible(false);
      setNewEvent({ date: '', time: '', title: '', description: '', location: '' });
      fetchEvents();
    } catch (error) {
      console.error('Error adding event:', error);
      Alert.alert('Error', 'An error occurred while adding the event.');
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setNewEvent({ date: '', time: '', title: '', description: '', location: '' });
  };

  useEffect(() => {
    fetchEvents();
    checkAdmin();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'<Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calendar</Text>
        </View>
        <Calendar
          markedDates={markedDates}
          dayComponent={({ date, state }: { date: DateObject; state: string }) => {
            const dateString = date.dateString;
            return (
              <View style={styles.dayContainer}>
                <Text style={[styles.dayText, state === 'disabled' && styles.disabledText]}>{date.day}</Text>
                {events[dateString] &&
                  events[dateString].map((event) => (
                    <TouchableOpacity
                      key={event.id}
                      style={styles.eventBox}
                      onPress={() => {
                        if (event.id) {
                          navigation.navigate('EventDetails', { eventId: event.id });
                        } else {
                          Alert.alert('Error', 'Event ID is missing.');
                        }
                      }}
                    >
                      <Text style={styles.eventText}>{event.title}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            );
          }}
          theme={{
            calendarBackground: '#1e1e1e',
            textSectionTitleColor: '#fff',
            selectedDayBackgroundColor: '#633393',
            selectedDayTextColor: '#fff',
            todayTextColor: '#ff9800',
            dayTextColor: '#fff',
            monthTextColor: '#fff',
            arrowColor: 'white',
            textDisabledColor: '#d9e1e8',
            dotColor: '#00adf5',
            selectedDotColor: '#ffffff',
            indicatorColor: 'white',
            textDayFontFamily: 'monospace',
            textMonthFontFamily: 'monospace',
            textDayHeaderFontFamily: 'monospace',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 16,
          }}
        />
        {isAdmin && (
          <>
            <TouchableOpacity
              style={styles.addEventButton}
              onPress={() => setModalVisible(true)}
            >
              <Icon name="add-circle" size={24} color="white" />
              <Text style={styles.addEventButtonText}>ADD NEW EVENT</Text>
            </TouchableOpacity>

            <Modal
              visible={isModalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={handleCloseModal}
            >
              <TouchableWithoutFeedback onPress={handleCloseModal}>
                <View style={styles.modalContainer}>
                  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalContent}>
                      <Text style={styles.modalTitle}>Add New Event</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Date (YYYY-MM-DD)"
                        placeholderTextColor="#999"
                        value={newEvent.date}
                        onChangeText={(text) => setNewEvent({ ...newEvent, date: text })}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Time (e.g., 10:30 AM)"
                        placeholderTextColor="#999"
                        value={newEvent.time}
                        onChangeText={(text) => setNewEvent({ ...newEvent, time: text })}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Title"
                        placeholderTextColor="#999"
                        value={newEvent.title}
                        onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Description"
                        placeholderTextColor="#999"
                        value={newEvent.description}
                        onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Location"
                        placeholderTextColor="#999"
                        value={newEvent.location}
                        onChangeText={(text) => setNewEvent({ ...newEvent, location: text })}
                      />
                      <View style={styles.modalButtonsContainer}>
                        <TouchableOpacity
                          style={[styles.modalButton, styles.cancelButton]}
                          onPress={handleCloseModal}
                        >
                          <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.modalButton, styles.confirmButton]}
                          onPress={handleAddEvent}
                        >
                          <Text style={styles.modalButtonText}>Add Event</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </>
        )}
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
    backgroundColor: '#1e1e1e',
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
  dayContainer: {
    alignItems: 'center',
    marginVertical: 5,
  },
  dayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#d9e1e8',
  },
  eventBox: {
    backgroundColor: '#fcb800',
    borderRadius: 5,
    marginTop: 5,
    padding: 5,
  },
  eventText: {
    color: 'black',
    fontSize: 10,
    textAlign: 'center',
  },
  addEventButton: {
    backgroundColor: '#633393',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    margin: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addEventButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    textTransform: 'uppercase',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#cccccc',
  },
  confirmButton: {
    backgroundColor: '#fcb800',
  },
  modalButtonText: {
    color: '#633393',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CalendarView;