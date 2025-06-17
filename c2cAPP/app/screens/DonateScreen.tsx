import React, { useState } from 'react';
import { StyleSheet, View, Button, Alert, ActivityIndicator } from 'react-native';
import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';

const DonateScreen = () => {
  const [cardDetails, setCardDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const { confirmPayment } = useConfirmPayment();

  const handlePayPress = async () => {
    if (!cardDetails?.complete) {
      Alert.alert('Error', 'Please enter complete card details.');
      return;
    }
  
    setLoading(true);
    try {
      // Make API call to the backend
      const response = await fetch('https://aa11-2600-387-3-801-00-1d.ngrok-free.app/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: 5000 }), // Amount in cents (e.g., 5000 = $50.00)
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error from backend:', errorText);
        throw new Error('Failed to create PaymentIntent');
      }
  
      // Parse the JSON response
      const { clientSecret } = await response.json();
      console.log('Received clientSecret:', clientSecret);
  
      // Confirm the payment using Stripe
      const { error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            email: 'test@example.com', // Optional: Add user's email or other info here
          },
        },
      });
  
      if (error) {
        console.error('Stripe confirmPayment Error:', error);
        Alert.alert('Payment Failed', error.message);
      } else {
        Alert.alert('Payment Success', 'Thank you for your donation!');
      }
    } catch (error) {
      console.error('Payment Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Pay" onPress={handlePayPress} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
  },
  cardContainer: {
    height: 50,
    marginVertical: 30,
  },
});

export default DonateScreen;