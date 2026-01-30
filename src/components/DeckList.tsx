import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '../db';
import Deck from '../db/models/Deck';
import Card from '../db/models/Card';

// 4. Card Item Component
const CardItem = ({ card }: { card: Card }) => (
  <View style={styles.cardItem}>
    <Text style={styles.cardFront}>Q: {card.content.front}</Text>
    <Text style={styles.cardBack}>A: {card.content.back}</Text>
    <Text style={styles.cardMeta}>Tags: {card.tags.join(', ')}</Text>
  </View>
);

// 5. Card List for a Deck
const DeckCardListComponent = ({ cards }: { cards: Card[] }) => (
  <View style={styles.cardList}>
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
    <View style={styles.itemWrapper}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.item}>
        <View>
          <Text style={styles.title}>{deck.title}</Text>
          <Text style={styles.subtitle}>{deck.subject} • {count} cards</Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
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
    <View style={styles.listContainer}>
      <Text style={styles.header}>Your Decks</Text>
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

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    width: '100%',
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1f2937',
  },
  itemWrapper: {
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  item: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  chevron: {
    fontSize: 18,
    color: '#9ca3af',
  },
  cardList: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cardItem: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardFront: {
    fontWeight: '600',
    marginBottom: 2,
  },
  cardBack: {
    color: '#374151',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 10,
    color: '#9ca3af',
  },
});
