import { StatusBar } from 'expo-status-bar';
import './global.css';
import { Text, View } from 'react-native';

// WatermelonDB imports to verify they resolve
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      <Text className="text-2xl font-bold text-blue-600">Cramit Phase 0</Text>
      <Text className="text-gray-600 mt-2">NativeWind is working!</Text>
      <StatusBar style="auto" />
    </View>
  );
}
