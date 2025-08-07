import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  ScrollView, 
  TextInput,
  StatusBar 
} from 'react-native';
import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import { Picker } from '@react-native-picker/picker';

const DonateScreen = () => {
  const [cardDetails, setCardDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  
  // Recurring donation frequency
  const [recurringFrequency, setRecurringFrequency] = useState('One time only');
  
  // Donor Information
  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('United States');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  
  // Organization Information (optional)
  const [isFromOrganization, setIsFromOrganization] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState('');
  
  // C2C Site Selection
  const [c2cSite, setC2cSite] = useState('National');
  
  // Tribute Information (optional)
  const [isTribute, setIsTribute] = useState(false);
  const [tributeTo, setTributeTo] = useState('');

  const { confirmPayment } = useConfirmPayment();

  const donationAmounts = [
    { amount: 3300, label: '$33 - helps 1 child' },
    { amount: 6600, label: '$66 - helps 2 children' },
    { amount: 10000, label: '$100 - helps 3 children' },
    { amount: 50000, label: '$500 - helps 15 children' },
    { amount: 100000, label: '$1,000 - helps 30 children' },
    { amount: 250000, label: '$2,500 - helps 75 children' },
  ];

  const c2cSites = [
    'National',
    'Philadelphia',
    'Boston', 
    'Chicago',
    'New York',
    'Giving Factory Direct'
  ];

  const organizationTypes = [
    'Company',
    'School',
    'Community Group',
    'Other Organization'
  ];

  const recurringOptions = [
    'One time only',
    'Weekly',
    '2 Weeks',
    'Monthly',
    '2 Months',
    'Quarterly',
    '6 Months',
    'Yearly'
  ];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setShowCustomAmount(false);
    setCustomAmount('');
  };

  const handleCustomAmountSelect = () => {
    setSelectedAmount(null);
    setShowCustomAmount(true);
  };

  const validateForm = () => {
    if (!cardDetails?.complete) {
      Alert.alert('Error', 'Please enter complete card details.');
      return false;
    }

    const finalAmount = selectedAmount || (parseFloat(customAmount) * 100);
    if (!finalAmount || finalAmount < 50) {
      Alert.alert('Error', 'Please select a donation amount of at least $0.50.');
      return false;
    }

    if (!firstName || !lastName || !email || !address || !city || !state || !zip) {
      Alert.alert('Error', 'Please fill in all required donor information fields.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return false;
    }

    return true;
  };

  const handlePayPress = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const finalAmount = selectedAmount || (parseFloat(customAmount) * 100);
      
      const donorInfo = {
        firstName,
        middleInitial,
        lastName,
        email,
        phone,
        country,
        address,
        city,
        state,
        zip
      };

      const organizationInfo = isFromOrganization ? {
        name: organizationName,
        type: organizationType
      } : null;

      const tributeInfo = isTribute ? {
        tributeTo
      } : null;

      const response = await fetch('https://00eb6cd7cbd3.ngrok-free.app/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: finalAmount,
          donorInfo,
          organizationInfo,
          c2cSite,
          tributeInfo
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error from backend:', errorText);
        throw new Error('Failed to create PaymentIntent');
      }

      const { clientSecret, donationId } = await response.json();
      console.log('Received clientSecret:', clientSecret);

      const { error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            email: email,
            name: `${firstName} ${lastName}`,
            address: {
              line1: address,
              city: city,
              state: state,
              postalCode: zip,
              country: 'US'
            }
          },
        },
      });

      if (error) {
        console.error('Stripe confirmPayment Error:', error);
        Alert.alert('Payment Failed', error.message);
        
        // Update donation status to failed
        await fetch('https://00eb6cd7cbd3.ngrok-free.app/update-donation-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: clientSecret.split('_secret_')[0],
            status: 'failed'
          }),
        });
      } else {
        // Update donation status to completed
        await fetch('https://00eb6cd7cbd3.ngrok-free.app/update-donation-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: clientSecret.split('_secret_')[0],
            status: 'completed'
          }),
        });
        
        Alert.alert('Payment Success', 'Thank you for your donation to Cradles to Crayons!');
        
        // Reset form
        setSelectedAmount(null);
        setCustomAmount('');
        setShowCustomAmount(false);
        setFirstName('');
        setMiddleInitial('');
        setLastName('');
        setEmail('');
        setPhone('');
        setAddress('');
        setCity('');
        setState('');
        setZip('');
        setIsFromOrganization(false);
        setOrganizationName('');
        setOrganizationType('');
        setIsTribute(false);
        setTributeTo('');
      }
    } catch (error) {
      console.error('Payment Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Make a Donation</Text>
        <Text style={styles.subHeaderText}>Help us #EndClothingInsecurity for children in need</Text>
      </View>

      {/* Amount Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Donation Amount</Text>
        
        {/* First Row: $33 and $66 */}
        <View style={styles.amountRow}>
          <TouchableOpacity
            style={[
              styles.amountButtonGrid,
              selectedAmount === 3300 && styles.selectedAmountButton
            ]}
            onPress={() => handleAmountSelect(3300)}
          >
            <Text style={[
              styles.amountButtonText,
              selectedAmount === 3300 && styles.selectedAmountButtonText
            ]}>
              $33 - helps 1 child
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.amountButtonGrid,
              selectedAmount === 6600 && styles.selectedAmountButton
            ]}
            onPress={() => handleAmountSelect(6600)}
          >
            <Text style={[
              styles.amountButtonText,
              selectedAmount === 6600 && styles.selectedAmountButtonText
            ]}>
              $66 - helps 2 children
            </Text>
          </TouchableOpacity>
        </View>

        {/* Second Row: $100 and $500 */}
        <View style={styles.amountRow}>
          <TouchableOpacity
            style={[
              styles.amountButtonGrid,
              selectedAmount === 10000 && styles.selectedAmountButton
            ]}
            onPress={() => handleAmountSelect(10000)}
          >
            <Text style={[
              styles.amountButtonText,
              selectedAmount === 10000 && styles.selectedAmountButtonText
            ]}>
              $100 - helps 3 children
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.amountButtonGrid,
              selectedAmount === 50000 && styles.selectedAmountButton
            ]}
            onPress={() => handleAmountSelect(50000)}
          >
            <Text style={[
              styles.amountButtonText,
              selectedAmount === 50000 && styles.selectedAmountButtonText
            ]}>
              $500 - helps 15 children
            </Text>
          </TouchableOpacity>
        </View>

        {/* Third Row: $1,000 and $2,500 */}
        <View style={styles.amountRow}>
          <TouchableOpacity
            style={[
              styles.amountButtonGrid,
              selectedAmount === 100000 && styles.selectedAmountButton
            ]}
            onPress={() => handleAmountSelect(100000)}
          >
            <Text style={[
              styles.amountButtonText,
              selectedAmount === 100000 && styles.selectedAmountButtonText
            ]}>
              $1,000 - helps 30 children
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.amountButtonGrid,
              selectedAmount === 250000 && styles.selectedAmountButton
            ]}
            onPress={() => handleAmountSelect(250000)}
          >
            <Text style={[
              styles.amountButtonText,
              selectedAmount === 250000 && styles.selectedAmountButtonText
            ]}>
              $2,500 - helps 75 children
            </Text>
          </TouchableOpacity>
        </View>

        {/* Other Amount - Centered */}
        <View style={styles.otherAmountContainer}>
          <TouchableOpacity
            style={[
              styles.otherAmountButton,
              showCustomAmount && styles.selectedAmountButton
            ]}
            onPress={handleCustomAmountSelect}
          >
            <Text style={[
              styles.amountButtonText,
              showCustomAmount && styles.selectedAmountButtonText
            ]}>
              Other Amount
            </Text>
          </TouchableOpacity>
        </View>

        {showCustomAmount && (
          <TextInput
            style={styles.customAmountInput}
            placeholder="Enter amount (e.g., 25.00)"
            value={customAmount}
            onChangeText={setCustomAmount}
            keyboardType="decimal-pad"
          />
        )}
      </View>

      {/* Recurring Frequency Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recurring</Text>
        <View style={styles.recurringContainer}>
          {/* First Row: One time only, Weekly, 2 Weeks, Monthly */}
          <View style={styles.recurringRow}>
            {recurringOptions.slice(0, 4).map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recurringOptionRow}
                onPress={() => setRecurringFrequency(option)}
              >
                <View style={[
                  styles.radioButton,
                  recurringFrequency === option && styles.radioButtonSelected
                ]}>
                  {recurringFrequency === option && <View style={styles.radioButtonInner} />}
                </View>
                <Text 
                  style={styles.recurringOptionTextRow} 
                  numberOfLines={option === 'One time only' ? 2 : 1}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Second Row: 2 Months, Quarterly, 6 Months, Yearly */}
          <View style={styles.recurringRow}>
            {recurringOptions.slice(4).map((option, index) => (
              <TouchableOpacity
                key={index + 4}
                style={styles.recurringOptionRow}
                onPress={() => setRecurringFrequency(option)}
              >
                <View style={[
                  styles.radioButton,
                  recurringFrequency === option && styles.radioButtonSelected
                ]}>
                  {recurringFrequency === option && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.recurringOptionTextRow} numberOfLines={1}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Donor Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Donor Information</Text>
        
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.flexInput]}
            placeholder="First Name *"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.initialInput}
            placeholder="MI"
            value={middleInitial}
            onChangeText={setMiddleInitial}
            maxLength={1}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Last Name *"
          value={lastName}
          onChangeText={setLastName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email *"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Address *"
          value={address}
          onChangeText={setAddress}
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.flexInput]}
            placeholder="City *"
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            style={styles.stateInput}
            placeholder="State *"
            value={state}
            onChangeText={setState}
          />
          <TextInput
            style={styles.zipInput}
            placeholder="ZIP *"
            value={zip}
            onChangeText={setZip}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Organization Information */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIsFromOrganization(!isFromOrganization)}
        >
          <View style={[styles.checkbox, isFromOrganization && styles.checkedBox]}>
            {isFromOrganization && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>This donation is from an organization</Text>
        </TouchableOpacity>

        {isFromOrganization && (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Organization Name"
              value={organizationName}
              onChangeText={setOrganizationName}
            />
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={organizationType}
                onValueChange={setOrganizationType}
                style={styles.picker}
              >
                <Picker.Item label="Select Organization Type" value="" />
                {organizationTypes.map((type, index) => (
                  <Picker.Item key={index} label={type} value={type} />
                ))}
              </Picker>
            </View>
          </View>
        )}
      </View>

      {/* Tribute Information */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIsTribute(!isTribute)}
        >
          <View style={[styles.checkbox, isTribute && styles.checkedBox]}>
            {isTribute && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>This donation is a tribute to someone</Text>
        </TouchableOpacity>

        {isTribute && (
          <TextInput
            style={styles.input}
            placeholder="Name of person this donation honors"
            value={tributeTo}
            onChangeText={setTributeTo}
          />
        )}
      </View>

      {/* C2C Site Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cradles to Crayons Site</Text>
        <View style={styles.c2cSiteContainer}>
          {/* First Row: National, Philadelphia, Boston */}
          <View style={styles.c2cSiteRow}>
            {c2cSites.slice(0, 3).map((site, index) => (
              <TouchableOpacity
                key={index}
                style={styles.c2cSiteOptionRow}
                onPress={() => setC2cSite(site)}
              >
                <View style={[
                  styles.radioButton,
                  c2cSite === site && styles.radioButtonSelected
                ]}>
                  {c2cSite === site && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.c2cSiteTextRow} numberOfLines={1}>
                  {site}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Second Row: Chicago, New York, Giving Factory Direct */}
          <View style={styles.c2cSiteRow}>
            {c2cSites.slice(3).map((site, index) => (
              <TouchableOpacity
                key={index + 3}
                style={styles.c2cSiteOptionRow}
                onPress={() => setC2cSite(site)}
              >
                <View style={[
                  styles.radioButton,
                  c2cSite === site && styles.radioButtonSelected
                ]}>
                  {c2cSite === site && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.c2cSiteTextRow} numberOfLines={2}>
                  {site}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Payment Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Information</Text>
        <CardField
          postalCodeEnabled={true}
          placeholders={{
            number: '4242 4242 4242 4242',
          }}
          cardStyle={styles.card}
          style={styles.cardContainer}
          onCardChange={(details) => {
            setCardDetails(details);
          }}
        />
      </View>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#633393" />
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={handlePayPress}>
            <Text style={styles.submitButtonText}>
              DONATE {selectedAmount ? `$${selectedAmount / 100}` : showCustomAmount && customAmount ? `$${customAmount}` : ''}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    backgroundColor: '#633393',
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subHeaderText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#FFF',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#633393',
    marginBottom: 15,
  },
  amountButton: {
    backgroundColor: '#F4F4F4',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedAmountButton: {
    backgroundColor: '#FCB800',
    borderColor: '#633393',
  },
  amountButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  selectedAmountButtonText: {
    color: '#000',
  },
  customAmountInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flexInput: {
    flex: 1,
  },
  initialInput: {
    width: 60,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  stateInput: {
    width: 80,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  zipInput: {
    width: 100,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    marginBottom: 10,
  },
  picker: {
    height: 50,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#633393',
    borderRadius: 3,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#633393',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  card: {
    backgroundColor: '#FFFFFF',
  },
  cardContainer: {
    height: 50,
    marginBottom: 20,
  },
  submitContainer: {
    padding: 20,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#FCB800',
    padding: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  amountButtonGrid: {
    backgroundColor: '#F4F4F4',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    flex: 0.48, // Takes up slightly less than half to account for spacing
  },
  otherAmountContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  otherAmountButton: {
    backgroundColor: '#F4F4F4',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    width: '60%', // Centered and narrower than grid buttons
  },
  recurringContainer: {
    flexDirection: 'column',
  },
  recurringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  recurringOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.23,
    minWidth: 0,
  },
  recurringOptionTextRow: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
    flex: 1,
    minWidth: 0,
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#633393',
    marginRight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioButtonSelected: {
    backgroundColor: '#633393',
  },
  radioButtonInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  },
  c2cSiteContainer: {
    flexDirection: 'column',
  },
  c2cSiteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  c2cSiteOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.31,
    minWidth: 0,
  },
  c2cSiteTextRow: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
    minWidth: 0,
  },
  c2cSiteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  c2cSiteText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
});

export default DonateScreen;