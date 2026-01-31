import { Model } from '@nozbe/watermelondb'
import { text, date, json } from '@nozbe/watermelondb/decorators'

const sanitizeSettings = (rawSettings: unknown) => {
  if (typeof rawSettings === 'object' && rawSettings !== null) {
      return rawSettings
  }
  return {}
}

export default class User extends Model {
  static table = 'users'

  @text('name') name!: string | null
  @text('referral_code') referralCode!: string | null
  @text('teacher_id') teacherId!: string | null
  @json('settings', sanitizeSettings) settings!: { [key: string]: any }
  @date('created_at') createdAt!: Date
  @date('updated_at') updatedAt!: Date
}
