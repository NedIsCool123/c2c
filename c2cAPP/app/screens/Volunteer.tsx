import React from 'react';
import { ScrollView, Image, StyleSheet, Dimensions, View, Text, TouchableOpacity, Linking, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

const Volunteer = () => {
  const handleVolunteerPress = () => {
    Linking.openURL('https://www.cradlestocrayons.org/philadelphia/take-action/volunteer/in-the-giving-factory/');
  };

  const handleCommunityVolunteerPress = () => {
    Linking.openURL('https://www.cradlestocrayons.org/philadelphia/take-action/volunteer/in-your-community/');
  };

  const handleCompanyVisitPress = () => {
    Linking.openURL('https://www.cradlestocrayons.org/philadelphia/take-action/volunteer/in-the-giving-factory/');
  };

  const handleLearnMorePress = () => {
    Linking.openURL('https://www.cradlestocrayons.org/philadelphia/take-action/volunteer/giving-corps/teen-leadership-corps/');
  };

  const handleChampionCorpsPress = () => {
    Linking.openURL('https://www.cradlestocrayons.org/philadelphia/take-action/volunteer/giving-corps/champion-corps/');
  };

  const handleCollegeCorpsPress = () => {
    Linking.openURL('https://www.cradlestocrayons.org/philadelphia/take-action/volunteer/giving-corps/college-corps/');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.imageContainer}>
        <Image source={require('../../assets/c2c-team.jpg')} style={styles.image} />
        <View style={styles.overlayTop}>
          <Text style={styles.headerText}>Want to Make a Real Difference?</Text>
          <TouchableOpacity style={styles.volunteerButton} onPress={handleVolunteerPress}>
            <Text style={styles.volunteerButtonText}>VOLUNTEER IN THE GIVING FACTORY</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.imageContainer}>
        <Image source={require('../../assets/c2c-kids.jpg')} style={styles.image} />
        <View style={styles.overlayBottom}>
          <Text style={styles.headerText}>Lend a Helping Hand</Text>
          <Text style={styles.descriptionText}>
            Get involved as a volunteer at Cradles to Crayons. Whether you help out in The Giving Factory or at home, you’ll become part of the spirit and energy that enables us to serve so many.
          </Text>
          <TouchableOpacity style={styles.communityVolunteerButton} onPress={handleCommunityVolunteerPress}>
            <Text style={styles.communityVolunteerButtonText}>VOLUNTEER IN YOUR COMMUNITY</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.textContainer}>
        <View style={styles.spacer} /> {/* space above fixed bottom section */}
        <View style={styles.headerContainer}>
          <Text style={styles.bigHeaderText}>DISCOVER THE JOY OF SERVING OTHERS</Text>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.longDescriptionText}>
            Volunteers are the <Text style={styles.boldText}>heart of Cradles to Crayons®</Text>, with many ways to help that fit your skills and schedule. 
            Each year, <Text style={styles.boldText}>24,000 volunteers</Text> help serve <Text style={styles.boldText}>70,000 children</Text> in Greater Philadelphia by sorting, inspecting, and <Text style={styles.boldText}>packaging donated items</Text>. 
            Join us at <Text style={styles.boldText}>The Giving Factory</Text> or community events to make a difference!
          </Text>
        </View>
        <View style={styles.companyVolunteerContainer}>
          <Text style={styles.companyVolunteerHeader}>Volunteer With Your Company</Text>
          <Image source={require('../../assets/c2c-volunteers.jpg')} style={styles.companyVolunteerImage} />
          <Text style={styles.companyVolunteerDescription}>
            Make a <Text style={styles.boldText}>big impact</Text> while <Text style={styles.boldText}>minimizing planning and logistics</Text>! 
            Often, the hard part is often finding a charity that matches your CSR goals and can handle your event.
            {'\n'}The Giving Factory at Cradles to Crayons is perfect for <Text style={styles.boldText}>corporate volunteering</Text> and <Text style={styles.boldText}>team-building</Text>. 
            It’s a <Text style={styles.boldText}>meaningful</Text>, <Text style={styles.boldText}>fun</Text>, and <Text style={styles.boldText}>productive</Text> way for your team to come together and <Text style={styles.boldText}>support a cause</Text> everyone can get behind.
          </Text>
          <TouchableOpacity style={styles.companyVisitButton} onPress={handleCompanyVisitPress}>
            <Text style={styles.companyVisitButtonText}>INQUIRE ABOUT YOUR NEXT COMPANY VISIT</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerContainer}>
          <Text style={styles.bigHeaderText}>JOIN THE GIVING CORPS</Text>
        </View>
        <View style={styles.centeredImageContainer}>
          <Image source={require('../../assets/tlc-c2c.jpg')} style={styles.joinGivingCorpsImage} />
          <View style={[styles.purpleBackground, styles.noTopMargin]}>
            <Text style={styles.tlcHeader}>Teen Leadership Corps (TLC)</Text>
            <Text style={styles.tlcDescription}>
              TLC is a fun way for high school students to get further involved in community service with Cradles to Crayons. The Teen Leadership Corps Program runs from June to May.
            </Text>
            <TouchableOpacity onPress={handleLearnMorePress}>
              <Text style={styles.learnMoreText}>Learn more about the TLC {'>'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.centeredImageContainer}>
          <Image source={require('../../assets/champ-corps-c2c.jpg')} style={styles.champCorpsImage} />
          <View style={[styles.purpleBackground, styles.noTopMargin]}>
            <Text style={styles.champCorpsHeader}>Champion Corps</Text>
            <Text style={styles.champCorpsDescription}>
              This program is a way for individuals to consistently participate at Cradles to Crayons, while fitting it into their own schedules. Champion Volunteer Leaders help lead volunteers at various processing stations throughout the warehouse.
            </Text>
            <TouchableOpacity onPress={handleChampionCorpsPress}>
              <Text style={styles.learnMoreText}>Learn more about our Champion Corps {'>'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.centeredImageContainer}>
          <Image source={require('../../assets/college-corps-c2c.jpg')} style={styles.collegeCorpsImage} />
          <View style={[styles.purpleBackground, styles.noTopMargin]}>
            <Text style={styles.collegeCorpsHeader}>College Corps</Text>
            <Text style={styles.collegeCorpsDescription}>
              As an intern, you will have the opportunity to gain the leadership skills it takes to be successful inside and outside of the nonprofit world.
            </Text>
            <TouchableOpacity onPress={handleCollegeCorpsPress}>
              <Text style={styles.learnMoreCollegeText}>Learn more about our College Corps {'>'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width,
    height: height / 2,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(252, 184, 0, 0.65)', // Semi-transparent background color
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBottom: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(99, 51, 147, 0.70)', // Semi-transparent background color
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'serif', // Use a serif font similar to Times New Roman
  },
  descriptionText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  volunteerButton: {
    backgroundColor: '#633393',
    paddingVertical: 8, // Smaller vertical padding
    paddingHorizontal: 15, // Smaller horizontal padding
    borderRadius: 5,
  },
  volunteerButtonText: {
    color: '#FFF',
    fontSize: 14, // Smaller font size
    fontWeight: 'bold',
    textAlign: 'center',
  },
  communityVolunteerButton: {
    backgroundColor: '#fcb800',
    paddingVertical: 8, // Smaller vertical padding
    paddingHorizontal: 15, // Smaller horizontal padding
    borderRadius: 5,
  },
  communityVolunteerButtonText: {
    color: '#000',
    fontSize: 14, // Smaller font size
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textContainer: {
    width: '100%',
    backgroundColor: '#f4f4f4',
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    backgroundColor: '#FCB800',
    padding: 20,
    alignItems: 'center',
  },
  bigHeaderText: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  descriptionContainer: {
    width: '100%',
    backgroundColor: '#f4f4f4',
    padding: 20,
  },
  longDescriptionText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  companyVolunteerContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#f4f4f4',
    alignItems: 'center',
  },
  companyVolunteerHeader: {
    color: '#633393',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'serif', // Use a serif font similar to Times New Roman
  },
  companyVolunteerImage: {
    width: width / 1.2,
    height: height / 5,
    resizeMode: 'cover',
    marginBottom: 20,
  },
  companyVolunteerDescription: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  companyVisitButton: {
    backgroundColor: '#633393',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  companyVisitButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centeredImageContainer: {
    width: '100%',
    alignItems: 'center', // Center the image horizontally
  },
  joinGivingCorpsImage: {
    width: width / 1.2,
    height: height / 3,
    resizeMode: 'contain',
  },
  champCorpsImage: {
    width: width / 1.2,
    height: height / 3,
    resizeMode: 'contain',
  },
  collegeCorpsImage: {
    width: width / 1.2,
    height: height / 3,
    resizeMode: 'contain',
  },
  purpleBackground: {
    width: width / 1.2,
    backgroundColor: '#633393',
    padding: 20,
    alignItems: 'center',
    paddingBottom: 10,
    borderRadius: 7, // Add border radius to round the edges
  },
  noTopMargin: {
    marginTop: 0, // Remove top margin
  },
  tlcHeader: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tlcDescription: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
  champCorpsHeader: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  champCorpsDescription: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
  collegeCorpsHeader: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  collegeCorpsDescription: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
  learnMoreText: {
    color: '#fcb800',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  learnMoreCollegeText: {
    color: '#fcb800',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  spacer: {
    height: 20,
    backgroundColor: '#F4F4F4',
  },
});

export default Volunteer;