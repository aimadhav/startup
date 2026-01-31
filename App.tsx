import './global.css';
import { StatusBar } from 'expo-status-bar';
import { View, SafeAreaView, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { seedDatabase, resetDatabase } from './src/db/seed';
import DeckList from './src/components/DeckList';
import { sync } from './src/services/sync';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await sync();
      console.log('Sync completed successfully');
    } catch (e) {
      console.error('Sync failed', e);
    } finally {
      setIsSyncing(false);
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
            <View className="flex-row gap-2">
              <TouchableOpacity 
                onPress={handleSync}
                disabled={isSyncing}
                className={`px-4 py-2 rounded-full border ${isSyncing ? 'bg-indigo-50 border-indigo-100' : 'bg-indigo-50 active:bg-indigo-100 border-indigo-200'} flex-row items-center gap-1`}
              >
                 {isSyncing ? (
                   <ActivityIndicator size="small" color="#4f46e5" />
                 ) : (
                   <Text className="text-indigo-600 text-xs font-bold uppercase tracking-wide">Sync</Text>
                 )}
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  Alert.alert(
                    "Reset Database",
                    "This will wipe all local data and replace it with seed data. Are you sure?",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Reset", style: "destructive", onPress: handleReset }
                    ]
                  );
                }} 
                className="px-4 py-2 bg-red-50 active:bg-red-100 rounded-full border border-red-200"
              >
                  <Text className="text-red-600 text-xs font-bold uppercase tracking-wide">Reset</Text>
              </TouchableOpacity>
            </View>
        </View>
        
        {dbReady ? (
          <DeckList />
        ) : (
          <View className="flex-1 items-center justify-center bg-gray-50">
            <Text className="text-gray-400 font-medium">Initializing Database...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
