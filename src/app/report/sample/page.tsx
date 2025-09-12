'use client'

import { AssessmentReport } from '@/components/report/AssessmentReport'

// Sample data for demonstration
const sampleResult = {
  id: 'sample-assessment-1',
  assessmentName: 'Relationship Patterns Assessment',
  completedAt: new Date().toISOString(),
  totalQuestions: 12,
  duration: '18 minutes',
  discoveredArchetypes: [
    {
      id: 'king',
      name: 'The King',
      description: 'A natural leader who seeks to create order and provide guidance, but may struggle with control and vulnerability in relationships.',
      confidenceScore: 87,
      assessmentContext: 'Your responses show a strong tendency to take charge in relationships and provide direction, while sometimes struggling to show vulnerability.',
      archetype_images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop'
      ],
      impact_score: 6,
      growth_potential_score: 7,
      awareness_difficulty_score: 4,
      trigger_intensity_score: 5,
      integration_complexity_score: 6,
      shadow_depth_score: 5,
      insights: {
        currentInfluence: 'You naturally take on leadership roles in relationships, providing stability and direction. However, this can sometimes manifest as controlling behavior when you feel threatened or uncertain.',
        growthOpportunity: 'Learning to balance your natural leadership with vulnerability and receptivity will deepen your relationships and reduce the burden of always being "in charge."',
        integrationTip: 'Practice asking for your partner\'s input before making decisions, and share your uncertainties and fears to build deeper intimacy.',
        shadowPattern: 'Tendency to become tyrannical or overly controlling when feeling insecure or challenged.'
      },
      resources: {
        theoreticalUnderstanding: 'The King archetype represents the mature masculine energy of leadership, order, and blessing. Rooted in ancient mythologies and Jungian psychology, this archetype embodies the capacity to create structure, provide guidance, and take responsibility for others.',
        embodimentPractices: [
          'Daily leadership meditation focusing on wise decision-making',
          'Practice blessing others through words and actions',
          'Regular self-reflection on power dynamics in relationships'
        ],
        integrationPractices: [
          'Weekly check-ins with partner about decision-making balance',
          'Vulnerability exercises to share fears and uncertainties',
          'Delegation practice to avoid over-controlling'
        ],
        articles: ['Understanding the King Archetype', 'Healthy Leadership in Relationships'],
        exercises: ['The Blessing Practice', 'Vulnerability Journaling'],
        affirmations: ['I lead with wisdom and compassion', 'I am strong enough to be vulnerable']
      },
      visualContent: {
        primaryImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        accentColor: '#8B5CF6'
      },
      mediaContent: {
        meditationAudio: '/audio/king-meditation.mp3',
        integrationVideo: '/video/king-integration.mp4',
        guidanceAudio: '/audio/king-guidance.mp3'
      }
    },
    {
      id: 'lover',
      name: 'The Lover',
      description: 'Deeply connected to emotions and relationships, seeking intimacy and passion, but may struggle with boundaries.',
      confidenceScore: 73,
      assessmentContext: 'Your language reveals a deep capacity for emotional connection and a desire for meaningful intimacy.',
      archetype_images: [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop'
      ],
      impact_score: 4,
      growth_potential_score: 8,
      awareness_difficulty_score: 3,
      trigger_intensity_score: 7,
      integration_complexity_score: 5,
      shadow_depth_score: 4,
      insights: {
        currentInfluence: 'You bring deep emotional intelligence and capacity for intimacy to your relationships, creating meaningful connections.',
        growthOpportunity: 'Developing healthy boundaries while maintaining your natural openness will help you avoid emotional overwhelm.',
        integrationTip: 'Practice saying no to emotional demands that drain you, while still honoring your gift for deep connection.'
      },
      resources: {
        theoreticalUnderstanding: 'The Lover archetype represents the energy of connection, passion, and emotional depth.',
        embodimentPractices: [
          'Heart-opening meditation practices',
          'Emotional boundary setting exercises'
        ],
        integrationPractices: [
          'Daily emotional check-ins',
          'Boundary practice with loved ones'
        ]
      },
      visualContent: {
        backgroundColor: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
        accentColor: '#E17055'
      },
      mediaContent: {
        meditationAudio: '/audio/lover-meditation.mp3'
      }
    }
  ],
  overallInsights: {
    primaryPattern: 'You embody a powerful combination of leadership and emotional depth, naturally taking charge while maintaining strong capacity for intimacy.',
    relationshipTheme: 'Your relationships are characterized by a desire to both lead and connect deeply, which can create beautiful partnerships when balanced.',
    growthAreas: [
      'Balancing control with vulnerability',
      'Setting healthy emotional boundaries',
      'Sharing decision-making power'
    ],
    strengthAreas: [
      'Natural leadership abilities',
      'Deep emotional intelligence',
      'Capacity for meaningful connection',
      'Protective instincts'
    ]
  },
  reportAnswers: {
    theoreticalUnderstanding: `Your assessment reveals a fascinating combination of The King and The Lover archetypes, representing a unique blend of leadership and emotional depth.

The King archetype, rooted in ancient mythologies and Jungian psychology, represents the mature masculine energy of leadership, order, and blessing. This archetype embodies the capacity to create structure, provide guidance, and take responsibility for others. In relationships, The King seeks to protect and provide, creating a sense of safety and direction.

The Lover archetype represents the energy of connection, passion, and emotional depth. This archetype is driven by the desire for intimacy, beauty, and meaningful relationships. The Lover brings emotional intelligence and the capacity for deep bonding.

Together, these archetypes create a powerful combination of strength and sensitivity, leadership and love. This combination can lead to deeply fulfilling relationships when integrated healthily, but may also create internal tension between the desire to control and the need to surrender in love.`,

    embodimentPractices: `To embody these archetypes in a healthy way, consider these practices:

**King Embodiment:**
- Daily leadership meditation focusing on wise decision-making
- Practice blessing others through words and actions
- Regular self-reflection on power dynamics in relationships
- Strength training or martial arts to embody healthy masculine energy

**Lover Embodiment:**
- Heart-opening meditation practices
- Emotional boundary setting exercises
- Creative expression through art, music, or writing
- Sensual awareness practices

**Integration Practices:**
- Morning intention setting for balanced leadership
- Evening gratitude practice for relationships
- Weekly relationship check-ins with your partner`,

    integrationPractices: `Integration involves bringing these archetypal energies into conscious awareness and daily practice:

**Daily Integration:**
- Start each day by setting an intention to lead with both strength and compassion
- Practice vulnerability by sharing one fear or uncertainty with your partner
- End each day by reflecting on how you showed up in your relationships

**Weekly Integration:**
- Have honest conversations with your partner about decision-making balance
- Practice delegation in one area where you typically take full control
- Engage in activities that nurture both your leadership and emotional sides

**Monthly Integration:**
- Assess your relationship patterns and adjust as needed
- Seek feedback from trusted friends about your leadership style
- Engage in deeper shadow work to understand your control patterns

**Ongoing Development:**
- Work with a therapist or coach familiar with archetypal psychology
- Join a men's group focused on healthy masculinity
- Study the myths and stories of healthy kings and lovers`,

    resourceLinks: [
      'https://example.com/king-archetype-guide',
      'https://example.com/lover-archetype-resources',
      'https://example.com/archetypal-psychology-basics'
    ],
    archetypeCards: ['The King', 'The Lover']
  }
}

export default function SampleReportPage() {
  const handleDownload = () => {
    console.log('Download report functionality would be implemented here')
  }

  const handleShare = () => {
    console.log('Share report functionality would be implemented here')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AssessmentReport 
        result={sampleResult}
        onDownload={handleDownload}
        onShare={handleShare}
      />
    </div>
  )
}
