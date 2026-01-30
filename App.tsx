import { StatusBar } from 'expo-status-bar';
import { Text, View, StyleSheet } from 'react-native';
import { supabase } from './src/lib/supabase';
import { useEffect, useState } from 'react';

export default function App() {
  const [supabaseStatus, setSupabaseStatus] = useState('Checking Connection...');
  const [envCheck, setEnvCheck] = useState('Checking Keys...');

  useEffect(() => {
    // 1. Check if keys loaded
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (url) {
        setEnvCheck(`Keys Loaded: ${url.slice(0, 15)}...`);
    } else {
        setEnvCheck('❌ Keys Missing in .env');
    }

    // 2. Ping Supabase
    const checkConnection = async () => {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            setSupabaseStatus('✅ Connected (No Session)');
        } catch (e: any) {
            setSupabaseStatus(`❌ Error: ${e.message}`);
        }
    };
    checkConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Real Environment Test</Text>
      
      {/* TEST 1: Styling Check (Manual) */}
      <View style={styles.box}>
        <Text style={styles.boxText}>
            Standard Styling Works
        </Text>
      </View>

      {/* TEST 2: Environment Variables */}
      <View style={styles.card}>
        <Text style={styles.label}>Environment:</Text>
        <Text style={styles.value}>{envCheck}</Text>
      </View>

      {/* TEST 3: Supabase Connection */}
      <View style={styles.card}>
        <Text style={styles.label}>Supabase:</Text>
        <Text style={styles.value}>{supabaseStatus}</Text>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1f2937',
  },
  box: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '80%',
  },
  boxText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  value: {
    color: '#4b5563',
  }
});
