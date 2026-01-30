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
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <View className="flex-1">
        {/* Header Section */}
        <View className="flex-row justify-between items-center px-6 py-4 bg-white shadow-sm z-10">
            <View>
              <Text className="text-3xl font-extrabold text-indigo-600 tracking-tight">Cramit</Text>
              <Text className="text-xs text-gray-500 font-medium">Master your memory</Text>
            </View>
            <TouchableOpacity 
              onPress={handleReset} 
              className="px-4 py-2 bg-red-50 active:bg-red-100 rounded-full border border-red-200"
            >
                <Text className="text-red-600 text-xs font-bold uppercase tracking-wide">Reset DB</Text>
            </TouchableOpacity>
        </View>
        
        {dbReady ? (
          <DeckList />
        ) : (
          <View className="flex-1 items-center justify-center bg-gray-50">
            <Text className="text-gray-400 font-medium animate-pulse">Initializing Database...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
