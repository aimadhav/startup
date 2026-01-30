import './global.css';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { seedDatabase, resetDatabase } from './src/db/seed';
import DeckList from './src/components/DeckList';

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await seedDatabase();
        setDbReady(true);
      } catch (e) {
        console.error('Failed to seed DB', e);
      }
    };
    init();
  }, []);

  const handleReset = async () => {
    setDbReady(false); // Show loading
    try {
      await resetDatabase();
      await seedDatabase();
      setDbReady(true);
    } catch (e) {
      console.error('Failed to reset DB', e);
      setDbReady(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Cramit</Text>
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                <Text style={styles.resetText}>Reset DB</Text>
            </TouchableOpacity>
        </View>
        
        {dbReady ? (
          <DeckList />
        ) : (
          <View style={styles.loading}>
            <Text>Initializing Database...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  resetButton: {
    padding: 8,
    backgroundColor: '#ef4444',
    borderRadius: 6,
  },
  resetText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
