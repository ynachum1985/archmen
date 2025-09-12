import { AssessmentResult } from '@/lib/services/assessment-results.service'

export function generateSampleAssessmentData(): AssessmentResult[] {
  return [
    {
      id: 'hero',
      name: 'The Hero',
      description: 'The Hero archetype represents courage, determination, and the drive to overcome challenges and achieve great things. Heroes are natural leaders who inspire others through their actions and willingness to face adversity.',
      confidenceScore: 87,
      isPrimary: true,
      assessmentContext: 'This archetype emerged strongly through your responses about taking initiative, facing challenges head-on, and your natural inclination to lead others through difficult situations.',
      evidence: [
        'Consistently mentioned taking responsibility in challenging situations',
        'Showed strong drive to overcome obstacles',
        'Demonstrated leadership qualities in responses',
        'Expressed desire to inspire and help others'
      ],
      visualContent: {
        primaryImage: '/api/placeholder/400/300',
        backgroundColor: '#1e40af',
        accentColor: '#3b82f6'
      },
      insights: {
        currentInfluence: 'The Hero archetype is currently driving your desire to take on challenges and lead others through difficult situations. You naturally step up when others need guidance or when obstacles need to be overcome.',
        growthOpportunity: 'You can develop this archetype by learning to balance your drive for achievement with self-care and collaboration. Consider how to inspire others without taking on all responsibilities yourself.',
        integrationTip: 'Practice recognizing when your Hero energy is needed versus when it might be overwhelming others. Learn to delegate and trust others to handle their own challenges.',
        whyThisArchetype: 'Your responses consistently showed patterns of taking responsibility, facing challenges head-on, and inspiring others to overcome obstacles. This indicates a strong Hero archetype presence in your personality.'
      },
      resources: {
        theoreticalUnderstanding: 'The Hero archetype, also known as the Warrior, represents the part of us that rises to meet challenges, takes responsibility for outcomes, and inspires others through courage and determination. This archetype is driven by the need to prove worth through courageous action and the desire to make a positive difference in the world.',
        embodimentPractices: [
          'Practice taking on challenges that stretch your comfort zone',
          'Lead by example in difficult situations',
          'Inspire others through your actions and courage',
          'Set clear goals and work persistently toward them',
          'Stand up for what you believe in, even when it\'s difficult'
        ],
        integrationPractices: [
          'Balance heroic action with rest and reflection',
          'Learn to accept help from others',
          'Recognize when to step back and let others lead',
          'Practice vulnerability and asking for support',
          'Develop patience with others who move at different paces'
        ],
        articles: [
          'The Hero\'s Journey: Understanding Your Path to Growth',
          'Leadership and Courage in Modern Times',
          'Balancing Achievement with Well-being'
        ],
        videos: [
          'The Psychology of Heroism',
          'Leading Through Adversity'
        ],
        exercises: [
          'Daily courage practice: Take one small brave action each day',
          'Leadership reflection: Journal about your leadership style',
          'Goal-setting workshop: Create a hero\'s journey map for your goals'
        ]
      },
      mediaContent: {
        meditationAudio: '/audio/hero-meditation.mp3',
        integrationVideo: '/video/hero-integration.mp4',
        guidanceAudio: '/audio/hero-guidance.mp3'
      }
    },
    {
      id: 'sage',
      name: 'The Sage',
      description: 'The Sage archetype embodies wisdom, knowledge, and the pursuit of truth and understanding. Sages are natural teachers and advisors who seek to understand the deeper meaning behind experiences.',
      confidenceScore: 74,
      isPrimary: true,
      assessmentContext: 'Your thoughtful responses and desire for understanding revealed this archetype. You consistently sought deeper meaning and showed a natural inclination to share wisdom.',
      evidence: [
        'Demonstrated deep thinking and reflection in responses',
        'Showed desire to understand complex situations',
        'Natural inclination to seek wisdom and truth',
        'Tendency to share insights and knowledge with others'
      ],
      visualContent: {
        primaryImage: '/api/placeholder/400/300',
        backgroundColor: '#7c3aed',
        accentColor: '#8b5cf6'
      },
      insights: {
        currentInfluence: 'The Sage in you seeks to understand the deeper meaning behind experiences and share wisdom with others. You naturally analyze situations and look for patterns and insights.',
        growthOpportunity: 'You can develop this archetype by balancing intellectual pursuits with practical application. Consider how to make your wisdom more accessible to others.',
        integrationTip: 'Share your insights in ways that others can easily understand and apply. Practice translating complex ideas into simple, actionable guidance.',
        whyThisArchetype: 'Your responses demonstrated deep thinking, a desire to understand complex situations, and a natural inclination to seek wisdom and truth. You showed patterns of reflection and analysis.'
      },
      resources: {
        theoreticalUnderstanding: 'The Sage archetype represents our inner wisdom, the part of us that seeks truth and understanding. Sages are motivated by the desire to understand the world and share knowledge that can help others navigate life\'s complexities.',
        embodimentPractices: [
          'Engage in regular study and learning',
          'Practice deep listening and observation',
          'Share knowledge in accessible ways',
          'Seek out mentors and teachers',
          'Cultivate patience and reflection'
        ],
        integrationPractices: [
          'Balance thinking with action',
          'Apply wisdom to practical situations',
          'Teach others what you have learned',
          'Practice humility and openness to new ideas',
          'Connect with others who share your love of learning'
        ],
        articles: [
          'The Wisdom of the Sage: Ancient Knowledge for Modern Times',
          'Teaching and Learning: The Sage\'s Path'
        ],
        videos: [
          'Cultivating Inner Wisdom',
          'The Art of Deep Listening'
        ],
        exercises: [
          'Daily reflection practice: Spend 10 minutes reflecting on the day\'s lessons',
          'Wisdom sharing: Teach someone something new each week',
          'Study practice: Dedicate time to learning something that interests you'
        ]
      },
      mediaContent: {
        meditationAudio: '/audio/sage-meditation.mp3',
        integrationVideo: '/video/sage-integration.mp4',
        guidanceAudio: '/audio/sage-guidance.mp3'
      }
    },
    {
      id: 'caregiver',
      name: 'The Caregiver',
      description: 'The Caregiver archetype represents nurturing, compassion, and the desire to help and support others. Caregivers are naturally empathetic and find fulfillment in serving others.',
      confidenceScore: 68,
      isPrimary: false,
      assessmentContext: 'Your caring responses and concern for others revealed this supporting archetype. You showed natural empathy and a desire to help others.',
      evidence: [
        'Showed genuine concern for others\' wellbeing',
        'Natural inclination to offer support and care',
        'Demonstrated empathy in responses',
        'Expressed desire to help and nurture others'
      ],
      visualContent: {
        primaryImage: '/api/placeholder/400/300',
        backgroundColor: '#059669',
        accentColor: '#10b981'
      },
      insights: {
        currentInfluence: 'The Caregiver in you naturally wants to support and nurture those around you. You find fulfillment in helping others and creating a sense of safety and comfort.',
        growthOpportunity: 'You can develop this archetype by learning to care for yourself as much as you care for others. Consider how to maintain your own well-being while helping others.',
        integrationTip: 'Set healthy boundaries while maintaining your compassionate nature. Remember that taking care of yourself enables you to better care for others.',
        whyThisArchetype: 'Your responses showed genuine concern for others\' wellbeing and a natural inclination to offer support and care. You demonstrated empathy and nurturing qualities.'
      },
      resources: {
        theoreticalUnderstanding: 'The Caregiver archetype represents our nurturing nature and desire to help others. Caregivers are motivated by the need to feel needed and the desire to protect and care for those who are vulnerable.',
        embodimentPractices: [
          'Practice active listening and empathy',
          'Offer support without expecting anything in return',
          'Create safe spaces for others to express themselves',
          'Show compassion and understanding',
          'Nurture growth in others'
        ],
        integrationPractices: [
          'Set healthy boundaries in relationships',
          'Practice self-care and self-compassion',
          'Learn to receive care from others',
          'Avoid enabling unhealthy behaviors',
          'Balance giving with receiving'
        ],
        articles: [
          'The Art of Caring: Nurturing Without Enabling',
          'Self-Care for Caregivers'
        ],
        videos: [
          'Healthy Boundaries in Caring Relationships',
          'The Importance of Self-Compassion'
        ],
        exercises: [
          'Self-care practice: Schedule regular time for your own needs',
          'Boundary setting: Practice saying no when necessary',
          'Gratitude practice: Acknowledge the care you receive from others'
        ]
      },
      mediaContent: {
        meditationAudio: '/audio/caregiver-meditation.mp3',
        integrationVideo: '/video/caregiver-integration.mp4',
        guidanceAudio: '/audio/caregiver-guidance.mp3'
      }
    },
    {
      id: 'explorer',
      name: 'The Explorer',
      description: 'The Explorer archetype represents the desire for freedom, adventure, and new experiences. Explorers are driven by curiosity and the need to discover new possibilities.',
      confidenceScore: 61,
      isPrimary: false,
      assessmentContext: 'Your responses showed a desire for new experiences and freedom, indicating this supporting archetype in your personality.',
      evidence: [
        'Expressed desire for new experiences',
        'Showed curiosity about different possibilities',
        'Demonstrated need for freedom and independence',
        'Interest in exploring new ideas and places'
      ],
      visualContent: {
        primaryImage: '/api/placeholder/400/300',
        backgroundColor: '#dc2626',
        accentColor: '#ef4444'
      },
      insights: {
        currentInfluence: 'The Explorer in you seeks new experiences and freedom from constraints. You are naturally curious and enjoy discovering new possibilities.',
        growthOpportunity: 'You can develop this archetype by balancing your need for freedom with commitment and responsibility. Consider how to explore while maintaining important relationships.',
        integrationTip: 'Channel your exploratory energy into meaningful pursuits that align with your values. Find ways to explore within your current commitments.',
        whyThisArchetype: 'Your responses indicated a desire for new experiences, freedom, and exploration. You showed curiosity about different possibilities and a need for independence.'
      },
      resources: {
        theoreticalUnderstanding: 'The Explorer archetype represents our need for freedom and new experiences. Explorers are motivated by the desire to find themselves through exploring the world and discovering new possibilities.',
        embodimentPractices: [
          'Seek out new experiences regularly',
          'Travel to new places, even locally',
          'Try new activities and hobbies',
          'Meet people from different backgrounds',
          'Challenge yourself with new learning'
        ],
        integrationPractices: [
          'Balance exploration with commitment',
          'Find adventure within your current life',
          'Share your discoveries with others',
          'Use exploration to deepen relationships',
          'Integrate new experiences into your daily life'
        ],
        articles: [
          'The Psychology of Adventure and Exploration',
          'Finding Freedom Within Structure'
        ],
        videos: [
          'Cultivating Curiosity and Wonder',
          'Balancing Freedom and Responsibility'
        ],
        exercises: [
          'Weekly adventure: Try something new each week',
          'Exploration journal: Document your discoveries',
          'Curiosity practice: Ask more questions in daily conversations'
        ]
      },
      mediaContent: {
        meditationAudio: '/audio/explorer-meditation.mp3',
        integrationVideo: '/video/explorer-integration.mp4',
        guidanceAudio: '/audio/explorer-guidance.mp3'
      }
    }
  ]
}
