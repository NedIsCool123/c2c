export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Inside: undefined;
  Messages: undefined;
  CalendarView: undefined;
  Chats: undefined;
  Chat: { chatId: string };
  EventDetails: { 
    eventId: string; // Expect eventId instead of the event object
  };
  Emails: undefined;
  Alerts: undefined;
  Home: undefined;
  Volunteer: undefined;
  Donate: undefined;
  You: undefined;
  ItemNeeds: undefined;
  PreMadeImages: undefined;
  DonateScreen: undefined;
  AdminPanel: undefined; // Add this line
};