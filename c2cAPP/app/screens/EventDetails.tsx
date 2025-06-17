import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Correct import
import { RootStackParamList } from '../../navigation/RootStackParamList';

interface Event {
  id?: string;
  date: string;
  time: string;
  title: string;
  description?: string;
  location?: string;
}

const EventDetails = ({ route }: any) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'EventDetails'>>(); // Typed navigation

  const fetchEventDetails = async () => {
    try {
      const eventDoc = await getDoc(doc(FIREBASE_DB, 'events', eventId));
      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        setEvent({
          id: eventId,
          date: eventData.Date || '',
          time: eventData.Time || '',
          title: eventData.Title || '',
          description: eventData.Description || '',
          location: eventData.Location || 'Philadelphia',
        });
      } else {
        Alert.alert('Error', 'Event not found.');
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      Alert.alert('Error', 'An error occurred while fetching the event details.');
    } finally {
      setLoading(false);
    }
  };

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=4700+Wissahickon+Ave+Suite+142,+Philadelphia,+PA+19144`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open Google Maps.');
    });
  };

  const setReminder = () => {
    Alert.alert(
      'Set Reminder',
      'This feature will redirect you to the Reminders app on your device.'
    );
    // Redirect to the device's reminders app (not universally supported).
  };

  const openAppNotifications = () => {
    Linking.openSettings().catch(() => {
      Alert.alert('Error', 'Could not open app settings for notifications.');
    });
  };

  useEffect(() => {
    fetchEventDetails();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#633393" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Top Section */}
        <View style={styles.topSection}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{'<Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calendar</Text>
        </View>

        {/* Yellow Box */}
        <View style={styles.yellowBox}>
          <View style={styles.circle}></View>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDateTime}>{`${event.date}, ${event.time}`}</Text>
        </View>

        {/* Location Section */}
        <View style={styles.locationSection}>
          <Text style={styles.locationText}>LOCATION: {event.location}</Text>
          <TouchableOpacity style={styles.googleMapsButton} onPress={openGoogleMaps}>
            <Text style={styles.googleMapsButtonText}>Open in Google Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.actionButton} onPress={setReminder}>
          <Text style={styles.actionButtonText}>Set a Reminder</Text>
        </TouchableOpacity>

        <Text style={styles.notificationPrompt}>
          Get notified by us with upcoming events!
        </Text>
        <TouchableOpacity style={styles.actionButton} onPress={openAppNotifications}>
          <Text style={styles.actionButtonText}>Turn on Notifications</Text>
        </TouchableOpacity>
      </ScrollView>
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  topSection: {
    backgroundColor: '#633393',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Add this
    height: 60, // Explicit height
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 1, // Ensure it's above other elements
    paddingVertical: 10, // Add vertical padding for better touch area
    paddingHorizontal: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold', // Make more visible
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  yellowBox: {
    backgroundColor: '#fcb800',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderColor: '#633393',
    borderWidth: 2,
    position: 'absolute',
    top: 16,
    left: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 40,
  },
  eventDateTime: {
    fontSize: 14,
    color: '#403f3f',
    marginLeft: 40,
    marginTop: 8,
  },
  locationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    color: 'white',
  },
  googleMapsButton: {
    backgroundColor: '#633393',
    padding: 10,
    borderRadius: 8,
  },
  googleMapsButtonText: {
    color: 'white',
    fontSize: 14,
  },
  actionButton: {
    backgroundColor: '#633393',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
  },
  notificationPrompt: {
    textAlign: 'center',
    color: 'white',
    marginVertical: 16,
  },
});

export default EventDetails;