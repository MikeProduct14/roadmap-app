import { describe, it, expect } from 'vitest'

// Логика валидации из Auth.jsx

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone) {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

const COUNTRY_CODES = [
  { code: '+7', minLen: 10, maxLen: 10, startsWith: ['9', '8', '7', '4', '3'] },
  { code: '+380', minLen: 9, maxLen: 9, startsWith: ['5', '6', '7', '9'] },
  { code: '+375', minLen: 9, maxLen: 9, startsWith: ['2', '3', '4'] },
  { code: '+998', minLen: 9, maxLen: 9, startsWith: ['9', '7', '6'] },
  { code: '+1', minLen: 10, maxLen: 10, startsWith: null },
  { code: '+44', minLen: 10, maxLen: 10, startsWith: null },
  { code: '+86', minLen: 11, maxLen: 11, startsWith: ['1'] },
]

function validatePhoneByCountry(countryCode, localNumber) {
  const country = COUNTRY_CODES.find(c => c.code === countryCode)
  if (!country) return { valid: false, error: 'Неизвестный код страны' }
  if (
    country.startsWith &&
    localNumber.length > 0 &&
    !country.startsWith.includes(localNumber[0])
  ) {
    return { valid: false, error: `Номер должен начинаться с: ${country.startsWith.join(', ')}` }
  }
  if (localNumber.length < country.minLen) {
    return { valid: false, error: `Нужно ${country.minLen} цифр, введено ${localNumber.length}` }
  }
  if (localNumber.length > country.maxLen) {
    return { valid: false, error: `Максимум ${country.maxLen} цифр` }
  }
  return { valid: true, error: '' }
}

// ─── Email validation ─────────────────────────────────────────

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true)
    expect(validateEmail('test123@mail.ru')).toBe(true)
  })

  it('rejects emails without @', () => {
    expect(validateEmail('userexample.com')).toBe(false)
  })

  it('rejects emails without domain', () => {
    expect(validateEmail('user@')).toBe(false)
  })

  it('rejects emails without TLD', () => {
    expect(validateEmail('user@domain')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(validateEmail('')).toBe(false)
  })

  it('rejects email with spaces', () => {
    expect(validateEmail('user @example.com')).toBe(false)
  })
})

// ─── Phone basic validation ───────────────────────────────────

describe('validatePhone (basic)', () => {
  it('accepts phone with 11 digits', () => {
    expect(validatePhone('+79991234567')).toBe(true)
  })

  it('accepts phone with 10 digits', () => {
    expect(validatePhone('+1234567890')).toBe(true)
  })

  it('rejects phone with fewer than 10 digits', () => {
    expect(validatePhone('+7999')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(validatePhone('')).toBe(false)
  })

  it('strips non-digits before counting', () => {
    expect(validatePhone('+7 (999) 123-45-67')).toBe(true)
  })
})

// ─── Phone validation by country ─────────────────────────────

describe('validatePhoneByCountry', () => {
  describe('+7 (Russia)', () => {
    it('accepts valid RU number starting with 9', () => {
      expect(validatePhoneByCountry('+7', '9991234567').valid).toBe(true)
    })

    it('rejects number starting with 1', () => {
      const result = validatePhoneByCountry('+7', '1234567890')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('начинаться с')
    })

    it('rejects number shorter than 10 digits', () => {
      const result = validatePhoneByCountry('+7', '99912345')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('10 цифр')
    })

    it('rejects number longer than 10 digits', () => {
      const result = validatePhoneByCountry('+7', '99912345678')
      expect(result.valid).toBe(false)
    })
  })

  describe('+380 (Ukraine)', () => {
    it('accepts valid UA number starting with 5', () => {
      expect(validatePhoneByCountry('+380', '501234567').valid).toBe(true)
    })

    it('rejects number starting with 1', () => {
      expect(validatePhoneByCountry('+380', '101234567').valid).toBe(false)
    })

    it('requires exactly 9 digits', () => {
      expect(validatePhoneByCountry('+380', '50123456').valid).toBe(false)
      expect(validatePhoneByCountry('+380', '501234567').valid).toBe(true)
    })
  })

  describe('+86 (China)', () => {
    it('accepts valid CN number starting with 1', () => {
      expect(validatePhoneByCountry('+86', '13800138000').valid).toBe(true)
    })

    it('rejects number not starting with 1', () => {
      expect(validatePhoneByCountry('+86', '23800138000').valid).toBe(false)
    })

    it('requires exactly 11 digits', () => {
      expect(validatePhoneByCountry('+86', '1380013800').valid).toBe(false)
    })
  })

  describe('+1 (USA)', () => {
    it('accepts any 10-digit number', () => {
      expect(validatePhoneByCountry('+1', '5551234567').valid).toBe(true)
    })

    it('rejects 9-digit number', () => {
      expect(validatePhoneByCountry('+1', '555123456').valid).toBe(false)
    })
  })
})
