import React, { useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity, Animated, Dimensions, SafeAreaView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootStackParamList';

const { height, width } = Dimensions.get('window');

type DonateScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Donate'>;

const Donate = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<DonateScreenNavigationProp>();

  useFocusEffect(
    React.useCallback(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      return () => {
        fadeAnim.setValue(0);
      };
    }, [fadeAnim])
  );

  return (
    <ScrollView style={styles.container}>
      <ImageBackground source={require('../../assets/clothing.jpg')} style={styles.backgroundImage}>
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safeArea}>
          <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
            <Text style={styles.headerText}>See how easy it is to help children living in poverty</Text>
            <Text style={styles.descriptionText}>
              We’re looking for high-quality new and like-new items you are able donate — for children newborn to age 12 — to help stock The Giving Factory.
            </Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('DonateScreen')}>
              <Text style={styles.buttonText}>DONATE FUNDS NOW</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>FIND A LOCAL DROP OFF</Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>
      <View style={styles.textContainer}>
        <Text style={styles.mainHeaderText}>For You, They’re Extra Belongings</Text>
        <Text style={styles.subHeaderText}>For a Child in Need, They’re Essentials</Text>
        <Text style={styles.descriptionContainer}>
          Cradles to Crayons accepts a wide range of donations of new and like-new items for children of all ages, from newborn to age 12. In our Giving Factory warehouses, we then hand-select items to create and distribute packages for specific kids. Here are two ways you can help:
          {'\n\n'}• Go through your closets, attic, basement, and/or garage to find new or like-new children’s items to donate.
          {'\n'}• Host a product collection drive at your home, school, workplace, place of worship, or in your community. Click the appropriate link below to learn more.
        </Text>
        <Image source={require('../../assets/clothing.jpg')} style={styles.inlineImage} />
        <Text style={styles.itemsHeaderText}>Items We Accept</Text>
        <Text style={styles.itemsDescriptionText}>
          A warm coat, well-fitting shoes, school supplies—just a few essentials a child in poverty needs. Donate high-quality new or like-new items for kids newborn to age 12. Help stock The Giving Factory warehouse through direct donations or a collection drive.
        </Text>
        <TouchableOpacity style={styles.learnMoreButton}>
          <Text style={styles.learnMoreButtonText}>Learn about what items we need most</Text>
        </TouchableOpacity>
        <Image source={require('../../assets/host-a-drive.jpg')} style={styles.inlineImage} />
        <Text style={styles.hostDriveHeaderText}>Host A Drive</Text>
        <Text style={styles.hostDriveDescriptionText}>
          Across your community, unused new or like-new children's clothes and books fill closets and shelves. Host a Cradles to Crayons collection drive to get these essentials to kids in need.
        </Text>
        <TouchableOpacity style={styles.hostDriveButton}>
          <Text style={styles.hostDriveButtonText}>Host a drive in your community</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomContainer} />
      <View style={styles.headerContainer}>
        <Text style={styles.bigHeaderText}>MORE WAYS TO DONATE GOODS</Text>
      </View>
      <View style={styles.purpleBox}>
        <Text style={styles.purpleBoxHeader}>Tax Receipt</Text>
        <Text style={styles.purpleBoxText}>
          All donations of children’s items are fully tax deductible – and we make it easy to get your receipt! Just fill out our simple online form and check your email. That’s it!
        </Text>
        <TouchableOpacity style={styles.smallYellowButton}>
          <Text style={styles.smallYellowButtonText}>Get your tax receipt</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.purpleBox}>
        <Text style={styles.purpleBoxHeader}>Amazon Wish List</Text>
        <Text style={styles.purpleBoxText}>
          Shop for our most needed items and have them shipped directly to our Giving Factory.
        </Text>
        <TouchableOpacity style={styles.smallYellowButton}>
          <Text style={styles.smallYellowButtonText}>Shop our Wish List</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.purpleBox}>
        <Text style={styles.purpleBoxHeader}>Giving Recipes</Text>
        <Text style={styles.purpleBoxText}>
          Need inspiration to incorporate giving back into your next event or milestone? Let us help guide your effort, while supplying all the materials you need to make it a success.
        </Text>
        <TouchableOpacity style={styles.smallYellowButton}>
          <Text style={styles.smallYellowButtonText}>Our Giving Recipes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    height: height * 0.6,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(99, 51, 147, 0.7)', // Purple with 70% opacity
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#fcb800',
    borderRadius: 10, // Slightly rounded corners
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#000', // Black text
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textContainer: {
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  mainHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#633393',
    textAlign: 'center',
    marginVertical: 10,
  },
  subHeaderText: {
    fontSize: 20,
    color: '#4a4a4a', // Slightly dark gray
    textAlign: 'center',
    marginVertical: 10,
  },
  descriptionContainer: {
    fontSize: 16,
    color: '#000',
    textAlign: 'left',
    marginVertical: 20,
  },
  inlineImage: {
    width: width * 0.9,
    height: height * 0.3,
    resizeMode: 'cover',
    marginTop: 30, // Reduced vertical margin
    alignSelf: 'center',
  },
  itemsHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#633393',
    textAlign: 'center',
    marginVertical: 10, // Reduced vertical margin
  },
  itemsDescriptionText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'left', // Reduced vertical margin
  },
  learnMoreButton: {
    backgroundColor: '#633393',
    borderRadius: 10, // Slightly rounded corners
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 25,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    alignSelf: 'center',
  },
  learnMoreButtonText: {
    color: '#fff', // White text
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hostDriveHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#633393',
    textAlign: 'center',
    marginVertical: 10, // Increased vertical margin
  },
  hostDriveDescriptionText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'left',
  },
  hostDriveButton: {
    backgroundColor: '#633393',
    borderRadius: 10, // Slightly rounded corners
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    alignSelf: 'center',
  },
  hostDriveButtonText: {
    color: '#fff', // White text
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  headerContainer: {
    width: '100%',
    backgroundColor: '#FCB800',
    padding: 10,
    alignItems: 'center',
  },
  bigHeaderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  purpleBox: {
    backgroundColor: '#633393',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  purpleBoxHeader: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  purpleBoxText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  smallYellowButton: {
    backgroundColor: '#fcb800',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    alignSelf: 'center',
  },
  smallYellowButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Donate;