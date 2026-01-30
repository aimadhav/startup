import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'decks',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'metadata', type: 'string', isOptional: true },
      ]
    }),
  ]
})
