import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '../db';
import Deck from '../db/models/Deck';
import Card from '../db/models/Card';

// 4. Card Item Component
const CardItem = ({ card }: { card: Card }) => (
  <View className="mb-3 p-4 bg-white rounded-xl border-l-4 border-l-indigo-500 shadow-sm">
    <View className="mb-2">
      <Text className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Question</Text>
      <Text className="text-gray-900 font-medium text-base">{card.content.front}</Text>
    </View>
    
    <View className="mb-3">
      <Text className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Answer</Text>
      <Text className="text-gray-600 text-base leading-relaxed">{card.content.back}</Text>
    </View>

    {card.tags.length > 0 && (
      <View className="flex-row flex-wrap gap-2 mt-2 pt-2 border-t border-gray-100">
        {card.tags.map((tag, index) => (
          <View key={`${card.id}-tag-${index}`} className="bg-indigo-50 px-2 py-1 rounded-md">
            <Text className="text-[10px] font-bold text-indigo-600 uppercase">{tag}</Text>
          </View>
        ))}
      </View>
    )}
  </View>
);

// 5. Card List for a Deck
const DeckCardListComponent = ({ cards }: { cards: Card[] }) => (
  <View className="bg-gray-50 p-4 border-t border-gray-100">
    {cards.length === 0 ? (
      <Text className="text-center text-gray-400 italic py-4">No cards in this deck yet.</Text>
    ) : (
      cards.map(card => (
        <CardItem key={card.id} card={card} />
      ))
    )}
  </View>
);

const enhanceDeckCards = withObservables(['deck'], ({ deck }) => ({
  cards: deck.cards,
}));

const DeckCards = enhanceDeckCards(DeckCardListComponent);

// 1. Enhanced Item Component
const DeckItemComponent = ({ deck, count }: { deck: Deck, count: number }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="mb-4 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)} 
        className={`p-5 flex-row justify-between items-center ${expanded ? 'bg-gray-50' : 'bg-white'}`}
      >
        <View className="flex-1 mr-4">
          <Text className="text-xl font-bold text-gray-900 mb-1">{deck.title}</Text>
          <View className="flex-row items-center">
            <View className="bg-gray-200 px-2 py-0.5 rounded text-xs mr-2">
               <Text className="text-xs font-medium text-gray-600">{deck.subject}</Text>
            </View>
            <Text className="text-xs text-gray-400 font-medium">{count} cards</Text>
          </View>
        </View>
        <View className={`w-8 h-8 items-center justify-center rounded-full ${expanded ? 'bg-indigo-100' : 'bg-gray-100'}`}>
           <Text className={`text-sm font-bold ${expanded ? 'text-indigo-600' : 'text-gray-500'}`}>
             {expanded ? '▲' : '▼'}
           </Text>
        </View>
      </TouchableOpacity>
      {expanded && <DeckCards deck={deck} />}
    </View>
  );
};

const enhanceDeckItem = withObservables(['deck'], ({ deck }) => ({
  deck,
  count: deck.cards.observeCount(),
}));

const DeckItem = enhanceDeckItem(DeckItemComponent);

// 2. List Component
const DeckListComponent = ({ decks }: { decks: Deck[] }) => {
  return (
    <View className="flex-1 w-full bg-gray-50">
      <FlatList
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        data={decks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <DeckItem deck={item} />}
        ListHeaderComponent={
          <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Your Decks</Text>
        }
      />
    </View>
  );
};

// 3. Connect to WatermelonDB
const enhanceList = withObservables([], () => ({
  decks: database.get<Deck>('decks').query(),
}));

export default enhanceList(DeckListComponent);
