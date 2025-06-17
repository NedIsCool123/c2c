import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

const Signup = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  // Animation refs
  const translateY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: -150,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: 500,
      useNativeDriver: true,
    }).start();
  }, [translateY, fadeAnim]);

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const normalizedUsername = username.trim().toLowerCase();

      // Check if username is taken (case-insensitive)
      const usersRef = collection(FIREBASE_DB, 'users');
      const q = query(usersRef, where('username', '==', normalizedUsername));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Custom error message for username conflict
        alert(`The username "${username}" is already taken. Please choose a different username.`);
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;

      // Save the username
      await addDoc(usersRef, {
        uid: user.uid,
        username: normalizedUsername,
        email: user.email,
      });

      alert('Account created! You can now log in.');
      navigation.navigate('Inside'); // Redirect to Inside after signup
    } catch (error: any) {
      // Catch any other errors and display a message
      alert('An error occurred during sign-up. Please try again. If this error continues, try switching your username, maybe it is taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          { transform: [{ translateY }] },
        ]}
      >
        <Image source={require('../../assets/icon.png')} style={styles.logo} />
      </Animated.View>
      <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
        <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoidingView}>
          <Text style={styles.header}>Create an Account</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          {loading ? (
            <ActivityIndicator size="large" color="#633393" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          )}
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    padding: 20,
  },
  logoContainer: {
    position: 'absolute',
    top: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 199,
    height: 199,
    resizeMode: 'contain',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#FFF',
  },
  button: {
    padding: 15,
    backgroundColor: '#633393',
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});