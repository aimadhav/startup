import { Model } from '@nozbe/watermelondb'
import { field, date, relation, text } from '@nozbe/watermelondb/decorators'
import Card from './Card'

export default class FsrsLog extends Model {
  static table = 'fsrs_logs'
  static associations = {
    cards: { type: 'belongs_to', key: 'card_id' },
  } as const

  @text('card_id') cardId!: string
  @field('rating') rating!: number // 1=Again, 2=Hard, 3=Good, 4=Easy
  @field('state') state!: number
  @field('stability') stability!: number
  @field('difficulty') difficulty!: number
  @field('elapsed_days') elapsedDays!: number
  @field('scheduled_days') scheduledDays!: number
  @date('due') due!: Date
  @date('last_review') lastReview!: Date
  @date('review') review!: Date

  @relation('cards', 'card_id') card!: any
}
