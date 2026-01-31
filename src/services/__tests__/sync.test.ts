import { pull, push } from '../sync'
import { supabase } from '../../lib/supabase'

jest.mock('../../db', () => ({
  database: {},
}))

// Mock Supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
  },
}))

describe('Sync Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('pull', () => {
    it('should pull all records when lastPulledAt is null', async () => {
      const mockData: Record<string, any[]> = {
        decks: [{ id: 'd1', title: 'Deck 1', updated_at: '2023-01-01T10:00:00.000Z' }],
        cards: [],
        users: [],
        fsrs_logs: []
      };

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        return {
          select: jest.fn().mockReturnValue({
            gt: jest.fn().mockResolvedValue({ data: mockData[table], error: null }),
            then: (resolve: any) => resolve({ data: mockData[table], error: null })
          })
        }
      })

      const result = await pull(null)

      expect(supabase.from).toHaveBeenCalledWith('decks')
      expect(result.changes.decks.updated).toHaveLength(1)
      expect(result.changes.decks.updated[0].id).toBe('d1')
      expect(typeof result.changes.decks.updated[0].updated_at).toBe('number')
    })

    it('should filter by updated_at when lastPulledAt is provided', async () => {
      const lastPulledAt = 1672531200000 // 2023-01-01
      
      const mockSelect = jest.fn().mockReturnThis()
      const mockGt = jest.fn().mockResolvedValue({ data: [], error: null })
      
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        gt: mockGt
      })

      await pull(lastPulledAt)

      expect(mockGt).toHaveBeenCalledWith('updated_at', lastPulledAt)
    })

    it('should map deleted records correctly', async () => {
      const mockData = [{ id: 'd1', deleted: true, updated_at: '2023-01-01T10:00:00.000Z' }];
      
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'decks') {
           return {
            select: jest.fn().mockResolvedValue({ data: mockData, error: null })
          }
        }
        return { select: jest.fn().mockResolvedValue({ data: [], error: null }) }
      })

      const result = await pull(null)
      
      expect(result.changes.decks.deleted).toContain('d1')
      expect(result.changes.decks.updated).toHaveLength(0)
    })
  })

  describe('push', () => {
    it('should upsert created and updated records without internal fields', async () => {
      const changes = {
        decks: {
          created: [{ id: 'd1', title: 'New Deck', created_at: 1672531200000, _status: 'created', _changed: '' }],
          updated: [{ id: 'd2', title: 'Updated Deck', updated_at: 1672531200000, _status: 'updated', _changed: '' }],
          deleted: []
        }
      }

      const mockUpsert = jest.fn().mockResolvedValue({ error: null });
      (supabase.from as jest.Mock).mockReturnValue({
        upsert: mockUpsert
      })

      await push(changes)

      expect(supabase.from).toHaveBeenCalledWith('decks')
      expect(mockUpsert).toHaveBeenCalledTimes(1)
      
      const upsertArgs = mockUpsert.mock.calls[0][0]
      expect(upsertArgs).toHaveLength(2) 
      
      // Check sanitization
      expect(upsertArgs[0]).not.toHaveProperty('_status')
      expect(upsertArgs[0]).not.toHaveProperty('_changed')
      expect(upsertArgs[0].id).toBe('d1')
      expect(typeof upsertArgs[0].created_at).toBe('number') 
    })

    it('should soft delete records', async () => {
      const changes = {
        cards: {
          created: [],
          updated: [],
          deleted: ['c1', 'c2']
        }
      }

      const mockUpdate = jest.fn().mockReturnThis()
      const mockIn = jest.fn().mockResolvedValue({ error: null });
      
      (supabase.from as jest.Mock).mockReturnValue({
        upsert: jest.fn(),
        update: mockUpdate,
        in: mockIn
      })

      await push(changes)

      expect(supabase.from).toHaveBeenCalledWith('cards')
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ deleted: true }))
      expect(mockIn).toHaveBeenCalledWith('id', ['c1', 'c2'])
    })
  })
})
