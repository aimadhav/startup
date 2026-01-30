import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'decks',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'subject', type: 'string', isOptional: true },
        { name: 'category', type: 'string', isOptional: true }, // e.g., 'Exam Prep', 'Language'
        { name: 'metadata', type: 'string', isOptional: true }, // JSON string for extra config
        { name: 'created_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'cards',
      columns: [
        { name: 'deck_id', type: 'string', isIndexed: true },
        { name: 'parent_id', type: 'string', isOptional: true, isIndexed: true }, // For Super Card siblings
        { name: 'content', type: 'string' }, // JSON: { front: "...", back: "..." }
        { name: 'tags', type: 'string', isOptional: true }, // JSON array: ["formula", "hard"]
        { name: 'card_type', type: 'string' }, // 'standard', 'super_parent', 'super_child'
        { name: 'created_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'fsrs_logs',
      columns: [
        { name: 'card_id', type: 'string', isIndexed: true },
        { name: 'state', type: 'number' }, // 0=New, 1=Learning, 2=Review, 3=Relearning
        { name: 'stability', type: 'number' },
        { name: 'difficulty', type: 'number' },
        { name: 'elapsed_days', type: 'number' },
        { name: 'scheduled_days', type: 'number' },
        { name: 'due', type: 'number' }, // Timestamp for next review
        { name: 'last_review', type: 'number' }, // Timestamp of last review
      ]
    }),
  ]
})
