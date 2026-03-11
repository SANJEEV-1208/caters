import { View, ActivityIndicator, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LoadingScreenProps {
  readonly message?: string;
  readonly useSafeArea?: boolean;
}

export default function LoadingScreen({
  message = 'Loading...',
  useSafeArea = true
}: LoadingScreenProps) {
  const Container = useSafeArea ? SafeAreaView : View;

  return (
    <Container style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <ActivityIndicator size="large" color="#10B981" />
      {Boolean(message) && <Text style={styles.message}>{message}</Text>}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});
