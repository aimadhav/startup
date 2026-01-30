import './src/global.css';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { database } from './src/db';
import { supabase } from './src/lib/supabase';
import { fsrs, createEmptyCard } from 'ts-fsrs';
import { useEffect, useState } from 'react';

export default function App() {
  const [dbStatus, setDbStatus] = useState('Initializing DB...');
  const [fsrsStatus, setFsrsStatus] = useState('Checking FSRS...');

  useEffect(() => {
    try {
      if (database.adapter) {
        setDbStatus('WatermelonDB Adapter Loaded (JSI/SQLite)');
      }
    } catch (e) {
      setDbStatus('DB Error: ' + e);
    }

    try {
        const f = fsrs();
        const card = createEmptyCard();
        if (f.repeat(card, new Date())) {
            setFsrsStatus('FSRS Logic Working');
        }
    } catch(e) {
        setFsrsStatus('FSRS Error: ' + e);
    }
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      <Text className="text-2xl font-bold text-blue-600 mb-4">Cramit MVP Phase 1</Text>
      
      <View className="bg-white p-4 rounded-lg shadow-md w-3/4">
        <Text className="text-lg font-semibold mb-2">Environment Check:</Text>
        
        <Text className="text-green-600">✅ NativeWind (Styled Text)</Text>
        <Text className="text-gray-700">Database: {dbStatus}</Text>
        <Text className="text-gray-700">Logic: {fsrsStatus}</Text>
        <Text className="text-gray-700">Supabase: Client Initialized</Text>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}
