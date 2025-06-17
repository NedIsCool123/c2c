import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { FIREBASE_DB } from '../../FirebaseConfig';

type Email = {
  id: string;
  subject: string;
  body: string;
  createdAt: number;
};

const EmailsScreen = () => {
  const navigation = useNavigation();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const emailsRef = collection(FIREBASE_DB, 'emails');
        const q = query(emailsRef);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const emailsList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Email[];
          setEmails(emailsList);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error fetching emails:', error);
          Alert.alert('Error fetching emails:', error.message);
        } else {
          console.error('Unexpected error', error);
          Alert.alert('Unexpected error', 'An unexpected error occurred');
        }
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  const renderEmail = ({ item }: { item: Email }) => (
    <View style={styles.emailCard}>
      <Text style={styles.emailSubject}>{item.subject}</Text>
      <Text style={styles.emailBody}>{item.body}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'<Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emails</Text>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : emails.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image source={require('../../assets/envelope.png')} style={styles.emptyImage} />
            <Text style={styles.emptyHeaderText}>No Emails</Text>
            <Text style={styles.emptyDescriptionText}>No current emails to be displayed</Text>
          </View>
        ) : (
          <FlatList data={emails} renderItem={renderEmail} keyExtractor={(item) => item.id} contentContainerStyle={styles.listContainer} />
        )}
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
  loadingText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 18,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  emailCard: {
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
  emailSubject: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#633393',
  },
  emailBody: {
    fontSize: 16,
    color: '#666',
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
  },
});

export default EmailsScreen;