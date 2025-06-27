export const ARCHETYPES = {
  KING: {
    id: 'king',
    name: 'The King',
    description: 'Leadership, order, and blessing',
    light: ['Wise leadership', 'Creating order', 'Blessing others', 'Taking responsibility'],
    shadow: ['Tyranny', 'Rigidity', 'Control issues', 'Inability to delegate'],
    relationshipPatterns: [
      'Takes charge in relationships',
      'Can be overly controlling',
      'Struggles with vulnerability',
      'Natural protector and provider'
    ]
  },
  WARRIOR: {
    id: 'warrior',
    name: 'The Warrior',
    description: 'Courage, discipline, and aggression',
    light: ['Courage', 'Discipline', 'Loyalty', 'Strategic thinking'],
    shadow: ['Aggression', 'Brutality', 'Emotional detachment', 'Win-at-all-costs mentality'],
    relationshipPatterns: [
      'Protective of loved ones',
      'Can be emotionally distant',
      'Values loyalty above all',
      'May struggle with emotional expression'
    ]
  },
  MAGICIAN: {
    id: 'magician',
    name: 'The Magician',
    description: 'Wisdom, intuition, and transformation',
    light: ['Wisdom', 'Intuition', 'Transformation', 'Knowledge seeking'],
    shadow: ['Manipulation', 'Detachment from reality', 'Using knowledge for power', 'Trickery'],
    relationshipPatterns: [
      'Deep understanding of partner',
      'Can be emotionally manipulative',
      'Values intellectual connection',
      'May overthink relationships'
    ]
  },
  LOVER: {
    id: 'lover',
    name: 'The Lover',
    description: 'Passion, connection, and sensuality',
    light: ['Passion', 'Empathy', 'Connection', 'Appreciation of beauty'],
    shadow: ['Addiction', 'Codependency', 'Loss of boundaries', 'Obsession'],
    relationshipPatterns: [
      'Deeply romantic and passionate',
      'Risk of losing self in relationships',
      'Strong emotional connection',
      'May struggle with boundaries'
    ]
  },
  HERO: {
    id: 'hero',
    name: 'The Hero',
    description: 'Courage, achievement, and triumph',
    light: ['Courage', 'Achievement', 'Inspiration', 'Overcoming challenges'],
    shadow: ['Ego inflation', 'Need for constant validation', 'Inability to accept help', 'Burnout'],
    relationshipPatterns: [
      'Inspires and motivates partner',
      'May neglect relationship for achievements',
      'Struggles to show weakness',
      'Needs recognition and validation'
    ]
  },
  SAGE: {
    id: 'sage',
    name: 'The Sage',
    description: 'Wisdom, detachment, and truth',
    light: ['Wisdom', 'Truth-seeking', 'Objectivity', 'Guidance'],
    shadow: ['Cynicism', 'Emotional detachment', 'Judgmental attitude', 'Isolation'],
    relationshipPatterns: [
      'Offers wise counsel',
      'Can be emotionally unavailable',
      'Values truth over feelings',
      'May seem cold or detached'
    ]
  },
  JESTER: {
    id: 'jester',
    name: 'The Jester',
    description: 'Joy, spontaneity, and humor',
    light: ['Humor', 'Joy', 'Spontaneity', 'Living in the moment'],
    shadow: ['Irresponsibility', 'Avoidance of seriousness', 'Superficiality', 'Self-destruction'],
    relationshipPatterns: [
      'Brings joy and laughter',
      'May avoid serious conversations',
      'Struggles with commitment',
      'Uses humor to deflect emotions'
    ]
  },
  CAREGIVER: {
    id: 'caregiver',
    name: 'The Caregiver',
    description: 'Nurturing, compassion, and service',
    light: ['Compassion', 'Nurturing', 'Selflessness', 'Generosity'],
    shadow: ['Codependency', 'Martyrdom', 'Enabling', 'Loss of self'],
    relationshipPatterns: [
      'Naturally nurturing and supportive',
      'May enable unhealthy behaviors',
      'Puts partner\'s needs first',
      'Can lose sense of self'
    ]
  }
} as const

export type ArchetypeId = keyof typeof ARCHETYPES
export type Archetype = typeof ARCHETYPES[ArchetypeId]

export interface ArchetypeScore {
  archetypeId: ArchetypeId
  score: number
  dominantTraits: string[]
  shadowTraits: string[]
}

export interface ArchetypeAssessment {
  primaryArchetype: ArchetypeId
  secondaryArchetype: ArchetypeId
  scores: ArchetypeScore[]
  shadowPatterns: {
    pattern: string
    archetype: ArchetypeId
    severity: 'low' | 'medium' | 'high'
  }[]
  recommendations: string[]
} 