import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootStackParamList';
import Icon from 'react-native-vector-icons/Ionicons';

const Messages: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.profilePicture} />
          <Image source={require('../../assets/c2c-logo.png')} style={styles.logo} />
        </View>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('CalendarView')}>
          <Icon name="calendar" size={24} color="black" />
          <Text style={styles.menuItemText}>Calendar</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Chats')}>
          <Icon name="chatbubbles" size={24} color="black" />
          <Text style={styles.menuItemText}>Chats</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Emails')}>
          <Icon name="mail" size={24} color="black" />
          <Text style={styles.menuItemText}>Emails</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Alerts')}>
          <Icon name="alert" size={24} color="black" />
          <Text style={styles.menuItemText}>Alerts</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ItemNeeds')}>
          <Icon name="shirt" size={24} color="black" />
          <Text style={styles.menuItemText}>Current Item Needs</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#8d8d8d',
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  topSection: {
    backgroundColor: '#8d8d8d',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    position: 'relative',
  },
  profilePicture: {
    width: 50,
    height: 50,
    backgroundColor: 'black',
    borderRadius: 25,
    position: 'absolute',
    left: 16,
    top: '50%',
    marginTop: -25,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  separator: {
    height: 1,
    backgroundColor: 'black',
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  menuItemText: {
    marginLeft: 8,
    fontSize: 16,
    color: 'black',
  },
});

export default Messages;
