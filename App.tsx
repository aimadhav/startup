import './global.css';
import { StatusBar } from 'expo-status-bar';
import { View, SafeAreaView, Text, TouchableOpacity } from 'react-native';
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
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="auto" />
      <View className="flex-1">
        <View className="flex-row justify-between items-center px-5 my-2.5">
            <Text className="text-3xl font-bold text-gray-800">Cramit</Text>
            <TouchableOpacity onPress={handleReset} className="p-2 bg-red-500 rounded-md">
                <Text className="text-white text-xs font-bold">Reset DB</Text>
            </TouchableOpacity>
        </View>
        
        {dbReady ? (
          <DeckList />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text>Initializing Database...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
