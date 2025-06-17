import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StripeProvider } from '@stripe/stripe-react-native';

import Login from './app/screens/Login';
import Signup from './app/screens/Signup';
import Home from './app/screens/Home';
import Volunteer from './app/screens/Volunteer';
import Donate from './app/screens/Donate';
import DonateScreen from './app/screens/DonateScreen';
import You from './app/screens/You';
import Messages from './app/screens/Messages';
import CalendarView from './app/screens/CalendarView';
import EventDetails from './app/screens/EventDetails';
import Chats from './app/screens/Chats';
import Chat from './app/screens/Chat';
import EmailsScreen from './app/screens/EmailsScreen';
import AlertsScreen from './app/screens/AlertsScreen';
import ItemNeeds from './app/screens/ItemNeeds';
import PreMadeImages from './app/screens/PreMadeImages';
import AdminPanel from './app/screens/AdminPanel';
import { onAuthStateChanged, User, getAuth } from 'firebase/auth';
import { RootStackParamList } from './navigation/RootStackParamList';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MessagesStack() {
  return (
    <Stack.Navigator initialRouteName="Messages">
      <Stack.Screen name="Messages" component={Messages} options={{ headerShown: false }} />
      <Stack.Screen name="CalendarView" component={CalendarView} options={{ headerShown: false }} />
      <Stack.Screen name="Chats" component={Chats} options={{ headerShown: false }} />
      <Stack.Screen name="Chat" component={Chat} options={{ headerShown: false }} />
      <Stack.Screen name="EventDetails" component={EventDetails} options={{ headerShown: false }} />
      <Stack.Screen name="Emails" component={EmailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Alerts" component={AlertsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ItemNeeds" component={ItemNeeds} options={{ headerShown: false }} />
      <Stack.Screen name="PreMadeImages" component={PreMadeImages} options={{ headerShown: false }} />
      <Stack.Screen name="AdminPanel" component={AdminPanel} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function DonateStack() {
  return (
    <Stack.Navigator initialRouteName="Donate">
      <Stack.Screen name="Donate" component={Donate} options={{ headerShown: false }} />
      <Stack.Screen name="DonateScreen" component={DonateScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Volunteer') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Donate') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'You') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Tab.Screen name="Volunteer" component={Volunteer} options={{ headerShown: false }} />
      <Tab.Screen
        name="Messages"
        component={MessagesStack}
        options={{ headerShown: false }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Messages');
          },
        })}
      />
      <Tab.Screen name="Donate" component={DonateStack} options={{ headerShown: false }} />
      <Tab.Screen name="You" component={You} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen
        name="Signup"
        component={Signup}
        options={({ navigation }) => ({
          headerLeft: () => (
            <Text
              onPress={() => navigation.goBack()}
              style={{
                color: '#633393',
                fontWeight: 'bold',
                marginLeft: 5,
                fontSize: 18,
              }}
            >
              &lt;Back
            </Text>
          ),
          headerStyle: { backgroundColor: '#F4F4F4' },
          headerTitle: '',
          headerShadowVisible: false,
        })}
      />
      <Stack.Screen name="Inside" component={TabNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const FIREBASE_AUTH = getAuth();

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log('user', user);
      setUser(user);
    });
  }, []);

  return (
    <StripeProvider
      publishableKey='pk_test_51R02LrEQ4DgeXJgXSL4HjbOKncv5A37Q3KDuFyyuQbTD6tvjyLL9zuYpOe9rORoisDibBZelaE9EwiePBReXMZCT00OChlKPEL'
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          {user ? <TabNavigator /> : <MainStack />}
        </NavigationContainer>
      </GestureHandlerRootView>
    </StripeProvider>
  );
}