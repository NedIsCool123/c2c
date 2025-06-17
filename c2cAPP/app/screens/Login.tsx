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
  StatusBar,
} from 'react-native';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/RootStackParamList';
import { useNavigation } from '@react-navigation/native';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();

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

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
    } catch (error: any) {
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('Signup');
  };

  const handleGuestLogin = () => {
    navigation.navigate('Inside'); // Navigate to the Inside stack
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
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
          {loading ? (
            <ActivityIndicator size="large" color="#633393" />
          ) : (
            <>
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={handleSignUp}>
                <Text style={styles.registerText}>Create an Account</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.guestButton]} onPress={handleGuestLogin}>
                <Text style={styles.guestText}>Continue as Guest</Text>
              </TouchableOpacity>
            </>
          )}
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    padding: 20,
  },
  header: {
    fontSize: 21,
    fontWeight: 'bold',
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
  registerButton: {
    backgroundColor: '#F4F4F4',
    borderWidth: 1,
    borderColor: '#633393',
  },
  registerText: {
    color: '#633393',
    fontWeight: 'bold',
    fontSize: 16,
  },
  guestButton: {
    backgroundColor: '#F4F4F4',
    borderWidth: 1,
    borderColor: '#633393',
  },
  guestText: {
    color: '#633393',
    fontWeight: 'bold',
    fontSize: 16,
  },
});