import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Animated, TouchableOpacity, Linking, ScrollView, TextInput, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

const Home = () => {
  const translateY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: -height / 2 + 100, // Adjust this value to control how far up the image goes
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

  const handleDonatePress = () => {
    Linking.openURL('https://www.cradlestocrayons.org/donate-now/');
  };

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Animated.View
        style={[
          styles.logoContainer,
          { transform: [{ translateY }] },
        ]}
      >
        <Image source={require('../../assets/icon.png')} style={styles.logo} />
      </Animated.View>

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <Image 
          source={require('../../assets/Cover-Kids.png')}
          style={styles.coverKids}
        />
        <Text style={styles.header}>Help #EndClothingInsecurity!</Text>
        <Text style={styles.description}>
          Cradles to Crayons defines Clothing Insecurity as a lack of access to affordable, appropriate clothing. We're on a mission to help 20 million kids across the U.S. get the essentials they need. Join us to ensure every child has a safe, healthy childhood!
        </Text>
        <TouchableOpacity style={styles.donateButton} onPress={handleDonatePress}>
          <Text style={styles.donateButtonText}>DONATE NOW!</Text>
        </TouchableOpacity>
      </Animated.View>
      <View style={styles.bottomSection}>
        <Animated.View style={[styles.bottomContainer, { opacity: fadeAnim }]}>
          <Text style={styles.bottomText}>
            Cradles to Crayons fights Children's Clothing Insecurity in Chicagoland, Massachusetts, Greater Philadelphia, NYC, and San Francisco while raising national awareness. Since 2002, we’ve provided nearly 6 million packages of essentials like clothing, shoes, diapers, and school supplies to kids in need.
          </Text>
          <Text style={styles.findDropOffText}>Find a Local Drop Off</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Zip or Address"
            />
            <TouchableOpacity style={styles.goButton}>
              <Text style={styles.goButtonText}>GO</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      <View style={styles.spacer} /> {/* space above fixed bottom section */}
      <View style={styles.fixedBottomSection}>

        <Image source={require('../../assets/icon-white.png')} style={styles.whiteLogo} />
        <Image source={require('../../assets/charity-logo.png')} style={styles.whiteLogo} />

        <View style={styles.socialMediaContainer}>
          <View style={styles.socialMediaRow}>
            <TouchableOpacity onPress={() => openLink('https://www.youtube.com')}>
              <Image source={require('../../assets/youtube.png')} style={styles.socialMediaIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openLink('https://www.instagram.com')}>
              <Image source={require('../../assets/instagram.png')} style={styles.socialMediaIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.socialMediaRow}>
            <TouchableOpacity onPress={() => openLink('https://www.twitter.com')}>
              <Image source={require('../../assets/twitter.png')} style={styles.socialMediaIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openLink('https://www.facebook.com')}>
              <Image source={require('../../assets/facebook.png')} style={styles.socialMediaIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.socialMediaRow}>
            <TouchableOpacity onPress={() => openLink('https://www.linkedin.com')}>
              <Image source={require('../../assets/linkedin.png')} style={styles.socialMediaIcon} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.aboutUsContainer}>
          <Text style={styles.aboutUsHeader}>About Us</Text>
          <TouchableOpacity onPress={() => openLink('https://www.cradlestocrayons.org/what-we-do/our-history/')}>
            <Text style={styles.aboutUsLink}>Our History</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://www.cradlestocrayons.org/what-we-do/our-culture/')}>
            <Text style={styles.aboutUsLink}>Our Culture</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://www.cradlestocrayons.org/what-we-do/our-leadership-and-staff/')}>
            <Text style={styles.aboutUsLink}>Leadership & Staff</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://www.cradlestocrayons.org/what-we-do/board-of-directors/')}>
            <Text style={styles.aboutUsLink}>Board of Directors</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://www.cradlestocrayons.org/what-we-do/audited-financials/')}>
            <Text style={styles.aboutUsLink}>Audited Financials</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://www.cradlestocrayons.org/what-we-do/careers/')}>
            <Text style={styles.aboutUsLink}>Careers</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://www.cradlestocrayons.org/contact-us/')}>
            <Text style={styles.aboutUsLink}>Contact Us</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://www.cradlestocrayons.org/privacy-policy/')}>
            <Text style={styles.aboutUsLink}>Privacy Policy</Text>
          </TouchableOpacity>
          
          <Text style={styles.locationsHeader}>Locations</Text>
          <TouchableOpacity onPress={() => openLink('https://www.cradlestocrayons.org/boston/')}>
            <Text style={styles.locationsLink}>Boston</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://www.cradlestocrayons.org/chicago/')}>
            <Text style={styles.locationsLink}>Chicago</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://www.cradlestocrayons.org/philadelphia/')}>
            <Text style={styles.locationsLink}>Philadelphia</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  logoContainer: {
    position: 'absolute',
    top: height / 2 - 100, // Start in the center of the screen
    left: width / 2 - 100, // Center horizontally
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 199,
    height: 199,
    resizeMode: 'contain',
    marginTop: 30,
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 150,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  donateButton: {
    backgroundColor: '#fcb800',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  donateButtonText: {
    color: '#00000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  spacer: {
    height: 20,
    backgroundColor: '#F4F4F4',
  },
  bottomSection: {
    backgroundColor: '#633393', // Second background color
    paddingTop: 20,
  },
  bottomContainer: {
    padding: 20,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFF', // Text color for better contrast
  },
  findDropOffText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFF', // Text color for better contrast
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    padding: 10,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#FFF', // Background color for better contrast
  },
  goButton: {
    backgroundColor: '#fcb800',
    padding: 10,
    borderRadius: 8,
  },
  goButtonText: {
    color: '#00000',
    fontWeight: 'bold',
  },
  coverKids: {
    width: width - 20,
    height: 150,
    resizeMode: 'contain',
  },
  fixedBottomSection: {
    backgroundColor: '#633393', // Second background color
    paddingTop: 10, // Adjusted padding to fit content
    paddingBottom: 10, // Adjusted padding to fit content
    alignItems: 'flex-start', // Align items to the start (left)
    paddingLeft: 20, // Add padding to the left
    position: 'relative', // Ensure absolute positioning works within this container
  },
  whiteLogo: {
    width: 120, // Slightly bigger size
    height: 90, // Slightly bigger size
    resizeMode: 'contain',
    marginBottom: 5, // Reduced margin to fit content
  },
  socialMediaContainer: {
    width: '100%',
  },
  socialMediaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Align items to the start (left)
    width: '100%',
    marginBottom: 10,
  },
  socialMediaIcon: {
    width: 40, // Slightly smaller size
    height: 40, // Slightly smaller size
    marginRight: 10, // Add margin to the right for spacing
  },
  aboutUsContainer: {
    position: 'absolute',
    top: 20,
    right: 80, // Adjusted to move closer to the left
    width: '40%',
    alignItems: 'center', // Center the content horizontally
    paddingLeft: 10, // Add padding to the left
  },
  aboutUsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center', // Center the text
    marginBottom: 5,
  },
  locationsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center', // Center the text
    marginTop: 5,
    marginBottom: 5,
  },
  aboutUsLink: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center', // Center the text
    marginBottom: 5,
  },
  locationsLink: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center', // Center the text
    marginBottom: 5,
  },
  bottomLogoContainer: {
    
  },
});

export default Home;