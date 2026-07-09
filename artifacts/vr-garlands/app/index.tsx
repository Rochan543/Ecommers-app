import { Redirect } from 'expo-router';

// Show splash screen as the first route — it handles auth state and navigates accordingly
export default function Index() {
  return <Redirect href="/splash" />;
}
