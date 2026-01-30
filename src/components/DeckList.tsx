import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '../db';
import Deck from '../db/models/Deck';
import Card from '../db/models/Card';

// 4. Card Item Component
const CardItem = ({ card }: { card: Card }) => (
  <View className="mb-2 p-2 bg-white rounded-md border border-gray-200">
    <Text className="font-semibold mb-0.5">Q: {card.content.front}</Text>
    <Text className="text-gray-700 mb-1">A: {card.content.back}</Text>
    <Text className="text-[10px] text-gray-400">Tags: {card.tags.join(', ')}</Text>
  </View>
);

// 5. Card List for a Deck
const DeckCardListComponent = ({ cards }: { cards: Card[] }) => (
  <View className="bg-gray-50 p-2.5 border-t border-gray-200">
    {cards.map(card => (
      <CardItem key={card.id} card={card} />
    ))}
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
    <View className="mb-2.5 bg-white rounded-xl overflow-hidden shadow-sm">
      <TouchableOpacity onPress={() => setExpanded(!expanded)} className="p-4 flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-semibold text-gray-900">{deck.title}</Text>
          <Text className="text-sm text-gray-500 mt-1">{deck.subject} • {count} cards</Text>
        </View>
        <Text className="text-lg text-gray-400">{expanded ? '▲' : '▼'}</Text>
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
    <View className="flex-1 w-full p-5">
      <Text className="text-xl font-bold mb-4 text-gray-800">Your Decks</Text>
      <FlatList
        data={decks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <DeckItem deck={item} />}
      />
    </View>
  );
};

// 3. Connect to WatermelonDB
const enhanceList = withObservables([], () => ({
  decks: database.get<Deck>('decks').query(),
}));

export default enhanceList(DeckListComponent);
