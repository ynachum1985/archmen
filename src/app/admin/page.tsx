"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Console</h1>
          <p className="text-gray-600">Develop assessments, archetypes, and content</p>
        </div>

        <Tabs defaultValue="assessments" className="space-y-6">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="content">Archetype Content</TabsTrigger>
            <TabsTrigger value="linguistics">Archetype Linguistics</TabsTrigger>
            <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
          </TabsList>

          <TabsContent value="assessments">
            <AssessmentDashboard />
          </TabsContent>

          <TabsContent value="content">
            <ArchetypeContent />
          </TabsContent>

          <TabsContent value="linguistics">
            <ArchetypeLinguistics />
          </TabsContent>

          <TabsContent value="ai-assistant">
            <AIAssistant />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function AssessmentDashboard() {
  const assessments = [
    { id: 1, name: 'Dating Patterns', questions: 12, active: true },
    { id: 2, name: 'Marriage Dynamics', questions: 18, active: true },
    { id: 3, name: 'Conflict Resolution', questions: 15, active: false },
    { id: 4, name: 'Shadow Work', questions: 8, active: true }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Assessments</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Create Assessment
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className="border border-gray-200 hover:border-gray-300 cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-gray-900">{assessment.name}</CardTitle>
                <span className={`px-2 py-1 text-xs rounded ${
                  assessment.active ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {assessment.active ? 'Active' : 'Draft'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">{assessment.questions} questions</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs">
                  Edit Questions
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  Test AI
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}





function ArchetypeContent() {
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const allArchetypes = [
    { name: 'The Advice Giver', category: 'Counselor', impact: 3, description: 'Offers guidance and solutions, sometimes unsolicited' },
    { name: 'The Advocate', category: 'Guardian', impact: 2, description: 'Protective, stands up for others and causes' },
    { name: 'The Alpha Male', category: 'Guardian', impact: 4, description: 'Dominant, leadership-focused, territorial' },
    { name: 'The Avoidant', category: 'Avoidant', impact: 5, description: 'Emotionally distant, avoids intimacy and conflict' },
    { name: 'The Bad Boy', category: 'Renegade', impact: 5, description: 'Rebellious, exciting, unpredictable, often unreliable' },
    { name: 'The Bloke', category: 'Avoidant', impact: 4, description: 'Simple, straightforward, emotionally neutral' },
    { name: 'The Breadwinner', category: 'Guardian', impact: 3, description: 'Provider-focused, measures worth through financial success' },
    { name: 'The Clueless Partner', category: 'Caretaker', impact: 4, description: 'Well-meaning but lacks emotional awareness' },
    { name: 'The Commander', category: 'Counselor', impact: 4, description: 'Takes charge, directive, can be controlling' },
    { name: 'The Compulsive Liar', category: 'Deceiver', impact: 6, description: 'Habitually dishonest, erodes trust fundamentally' },
    { name: 'The Defeatist', category: 'Possessor', impact: 5, description: 'Pessimistic, expects failure, self-fulfilling prophecy' },
    { name: 'The Empath', category: 'Caretaker', impact: 2, description: 'Highly sensitive, emotionally attuned, caring' },
    { name: 'The Emotional Coach', category: 'Counselor', impact: 3, description: 'Helps others process emotions, sometimes overwhelming' },
    { name: 'The Emotional Dependent', category: 'Possessor', impact: 4, description: 'Needs constant emotional validation and support' },
    { name: 'The Empowered Man', category: 'Guardian', impact: 2, description: 'Self-aware, confident, emotionally intelligent' },
    { name: 'The Gentleman', category: 'Conservative', impact: 2, description: 'Courteous, respectful, traditional romance' },
    { name: 'The Guru', category: 'Counselor', impact: 4, description: 'Spiritual or philosophical teacher, can be preachy' },
    { name: 'The Harmonizer', category: 'Caretaker', impact: 3, description: 'Seeks peace, avoids conflict, people-pleaser' },
    { name: 'The Hedonist', category: 'Seducer', impact: 5, description: 'Pleasure-seeking, immediate gratification, selfish' },
    { name: 'The Hypocrite', category: 'Critic', impact: 5, description: 'Double standards, judges others while failing themselves' },
    { name: 'The Idealist', category: 'Innovator', impact: 3, description: 'Visionary, seeks perfect relationship, unrealistic expectations' },
    { name: 'The Imposter', category: 'Innovator', impact: 4, description: 'Feels unworthy, hides true self, fear of being discovered' },
    { name: 'The Legalist', category: 'Conservative', impact: 4, description: 'Rule-focused, rigid, justice-oriented' },
    { name: 'The Lover', category: 'Seducer', impact: 3, description: 'Passionate, romantic, heart-centered, devoted' },
    { name: 'The Magician', category: 'Innovator', impact: 3, description: 'Transformative, creates positive change, inspiring' },
    { name: 'The Mansplainer', category: 'Critic', impact: 5, description: 'Condescending, over-explains, assumes superiority' },
    { name: 'The Martyr', category: 'Caretaker', impact: 4, description: 'Self-sacrificing, seeks recognition for suffering' },
    { name: 'The Maverick', category: 'Renegade', impact: 4, description: 'Independent, unconventional, resists conformity' },
    { name: 'The Misogynist', category: 'Conservative', impact: 7, description: 'Devalues women, sexist attitudes, harmful beliefs' },
    { name: 'The Mr. Fix-It', category: 'Counselor', impact: 3, description: 'Solution-focused, wants to repair everything' },
    { name: 'The Narcissist', category: 'Deceiver', impact: 7, description: 'Self-centered, manipulative, lacks empathy' },
    { name: 'The New Masculine', category: 'Innovator', impact: 2, description: 'Balanced masculine energy, emotionally evolved' },
    { name: 'The Opportunist', category: 'Deceiver', impact: 6, description: 'Uses others for personal gain, manipulative' },
    { name: 'The Passive-Aggressor', category: 'Possessor', impact: 5, description: 'Indirect anger, avoids direct confrontation' },
    { name: 'The Perfectionist', category: 'Possessor', impact: 5, description: 'Impossibly high standards, critical, never satisfied' },
    { name: 'The Peter Pan', category: 'Avoidant', impact: 5, description: 'Refuses to grow up, avoids responsibility' },
    { name: 'The Philosopher', category: 'Innovator', impact: 2, description: 'Deep thinker, contemplative, seeks meaning' },
    { name: 'The Possessive', category: 'Possessor', impact: 6, description: 'Jealous, controlling, insecure about losing partner' },
    { name: 'The Pragmatist', category: 'Caretaker', impact: 4, description: 'Practical, logical, may lack emotional expression' },
    { name: 'The Preaching Critic', category: 'Critic', impact: 5, description: 'Moralizes, judges, self-righteous' },
    { name: 'The Projector', category: 'Avoidant', impact: 5, description: 'Blames others for own issues, lacks self-awareness' },
    { name: 'The Provocateur', category: 'Renegade', impact: 4, description: 'Stirs up drama, enjoys conflict and chaos' },
    { name: 'The Righteous', category: 'Critic', impact: 5, description: 'Morally superior, judges others harshly' },
    { name: 'The Romantic Idealist', category: 'Seducer', impact: 4, description: 'Seeks perfect love, unrealistic romantic expectations' },
    { name: 'The Saboteur', category: 'Renegade', impact: 7, description: 'Undermines relationships, self-destructive, creates chaos' },
    { name: 'The Status Seeker', category: 'Deceiver', impact: 5, description: 'Image-focused, values appearances over substance' },
    { name: 'The Stoic', category: 'Conservative', impact: 3, description: 'Emotionally controlled, disciplined, may be distant' },
    { name: 'The Stonewaller', category: 'Avoidant', impact: 5, description: 'Shuts down communication, emotionally unavailable' },
    { name: 'The Traditionalist', category: 'Conservative', impact: 3, description: 'Values traditional roles and relationships' },
    { name: 'The Transactional Partner', category: 'Deceiver', impact: 5, description: 'Treats relationship like business deal, conditional love' },
    { name: 'The Trickster', category: 'Renegade', impact: 5, description: 'Playful but manipulative, enjoys mind games' },
    { name: 'The Unattainable Lover', category: 'Seducer', impact: 6, description: 'Emotionally unavailable, keeps partners at distance' },
    { name: 'The Virtue Signaller', category: 'Critic', impact: 4, description: 'Performs moral superiority, inauthentic values' },
    { name: 'The White Knight', category: 'Guardian', impact: 3, description: 'Rescuer, saves others, may enable dependency' },
    { name: 'The Womaniser', category: 'Seducer', impact: 7, description: 'Uses and discards women, emotionally harmful' }
  ]

  const filteredArchetypes = allArchetypes
    .filter(archetype => {
      if (filterBy === 'all') return true
      return archetype.category === filterBy
    })
    .filter(archetype =>
      archetype.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      archetype.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'category') return a.category.localeCompare(b.category)
      if (sortBy === 'impact') return a.impact - b.impact
      return 0
    })

  const categories = [...new Set(allArchetypes.map(a => a.category))].sort()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Archetype Content</h2>
        <Button className="bg-teal-600 hover:bg-teal-700">
          Add Archetype
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search archetypes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="name">Sort by Name</option>
          <option value="category">Sort by Category</option>
          <option value="impact">Sort by Impact</option>
        </select>
      </div>

      <div className="space-y-1">
        {filteredArchetypes.map((archetype, index) => (
          <div key={index} className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-gray-900">{archetype.name}</h3>
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  {archetype.category}
                </span>
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  {archetype.impact}/7
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{archetype.description}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500">{filteredArchetypes.length} of {allArchetypes.length} archetypes</p>
    </div>
  )
}
function ArchetypeLinguistics() {
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const allPatterns = [
    { name: 'The Advice Giver', category: 'Counselor', keywords: ['advice', 'should', 'suggest', 'recommend'], phrases: ['you should', 'I recommend', 'let me suggest'], emotional: ['helpful', 'guidance'], behavioral: ['offers solutions', 'gives direction'] },
    { name: 'The Advocate', category: 'Guardian', keywords: ['fight', 'defend', 'protect', 'support'], phrases: ['I stand for', 'I believe in', 'I support'], emotional: ['protective', 'determined'], behavioral: ['stands up for others', 'defends causes'] },
    { name: 'The Alpha Male', category: 'Guardian', keywords: ['lead', 'control', 'charge', 'dominant'], phrases: ['I lead', 'I take charge', 'I control'], emotional: ['confident', 'assertive'], behavioral: ['takes leadership', 'dominates conversations'] },
    { name: 'The Avoidant', category: 'Avoidant', keywords: ['space', 'alone', 'distance', 'withdraw'], phrases: ['I need space', 'I prefer alone', 'keep distance'], emotional: ['detached', 'distant'], behavioral: ['withdraws', 'avoids intimacy'] },
    { name: 'The Bad Boy', category: 'Renegade', keywords: ['rebel', 'rules', 'break', 'wild'], phrases: ['break the rules', 'live dangerously', 'rebel against'], emotional: ['rebellious', 'reckless'], behavioral: ['breaks conventions', 'unpredictable'] },
    { name: 'The Bloke', category: 'Avoidant', keywords: ['simple', 'straightforward', 'uncomplicated'], phrases: ['keep it simple', 'no drama', 'straightforward'], emotional: ['neutral', 'practical'], behavioral: ['avoids complexity', 'matter-of-fact'] },
    { name: 'The Breadwinner', category: 'Guardian', keywords: ['provide', 'money', 'work', 'support'], phrases: ['I provide for', 'I work hard', 'financial security'], emotional: ['responsible', 'driven'], behavioral: ['focuses on providing', 'work-oriented'] },
    { name: 'The Clueless Partner', category: 'Caretaker', keywords: ['confused', 'understand', 'lost', 'help'], phrases: ['I don\'t understand', 'I\'m confused', 'help me'], emotional: ['confused', 'uncertain'], behavioral: ['seeks guidance', 'lacks awareness'] },
    { name: 'The Commander', category: 'Counselor', keywords: ['command', 'order', 'direct', 'manage'], phrases: ['I command', 'follow my lead', 'I direct'], emotional: ['authoritative', 'controlling'], behavioral: ['gives orders', 'takes control'] },
    { name: 'The Compulsive Liar', category: 'Deceiver', keywords: ['actually', 'truth', 'honest', 'believe'], phrases: ['trust me', 'honestly', 'the truth is'], emotional: ['deceptive', 'manipulative'], behavioral: ['lies frequently', 'creates false stories'] },
    { name: 'The Defeatist', category: 'Possessor', keywords: ['can\'t', 'won\'t work', 'impossible', 'fail'], phrases: ['it won\'t work', 'I can\'t', 'it\'s impossible'], emotional: ['pessimistic', 'hopeless'], behavioral: ['expects failure', 'gives up easily'] },
    { name: 'The Empath', category: 'Caretaker', keywords: ['feel', 'understand', 'sense', 'emotion'], phrases: ['I feel your pain', 'I understand', 'I sense'], emotional: ['empathetic', 'sensitive'], behavioral: ['reads emotions', 'highly sensitive'] },
    { name: 'The Emotional Coach', category: 'Counselor', keywords: ['feelings', 'process', 'explore', 'emotional'], phrases: ['how do you feel', 'let\'s explore', 'process this'], emotional: ['analytical', 'supportive'], behavioral: ['guides emotions', 'asks deep questions'] },
    { name: 'The Emotional Dependent', category: 'Possessor', keywords: ['need', 'require', 'depend', 'validation'], phrases: ['I need you', 'I depend on', 'validate me'], emotional: ['needy', 'insecure'], behavioral: ['seeks validation', 'emotionally clingy'] },
    { name: 'The Empowered Man', category: 'Guardian', keywords: ['confident', 'authentic', 'balance', 'growth'], phrases: ['I am confident', 'authentic self', 'balanced approach'], emotional: ['confident', 'secure'], behavioral: ['emotionally intelligent', 'self-aware'] },
    { name: 'The Gentleman', category: 'Conservative', keywords: ['respect', 'courtesy', 'honor', 'gentleman'], phrases: ['with respect', 'honor you', 'gentleman\'s way'], emotional: ['respectful', 'dignified'], behavioral: ['courteous behavior', 'traditional manners'] },
    { name: 'The Guru', category: 'Counselor', keywords: ['wisdom', 'enlightenment', 'spiritual', 'teach'], phrases: ['the wisdom', 'enlightened path', 'let me teach'], emotional: ['wise', 'spiritual'], behavioral: ['shares wisdom', 'teaches others'] },
    { name: 'The Harmonizer', category: 'Caretaker', keywords: ['peace', 'harmony', 'balance', 'together'], phrases: ['keep peace', 'find harmony', 'work together'], emotional: ['peaceful', 'diplomatic'], behavioral: ['avoids conflict', 'seeks balance'] },
    { name: 'The Hedonist', category: 'Seducer', keywords: ['pleasure', 'fun', 'enjoy', 'experience'], phrases: ['for pleasure', 'let\'s enjoy', 'experience life'], emotional: ['pleasure-seeking', 'indulgent'], behavioral: ['pursues pleasure', 'self-indulgent'] },
    { name: 'The Hypocrite', category: 'Critic', keywords: ['standards', 'others', 'should', 'but'], phrases: ['others should', 'not like me', 'different standards'], emotional: ['judgmental', 'inconsistent'], behavioral: ['double standards', 'judges others'] },
    { name: 'The Idealist', category: 'Innovator', keywords: ['perfect', 'ideal', 'vision', 'dream'], phrases: ['perfect relationship', 'ideal situation', 'my vision'], emotional: ['optimistic', 'dreamy'], behavioral: ['seeks perfection', 'high expectations'] },
    { name: 'The Imposter', category: 'Innovator', keywords: ['fake', 'pretend', 'real', 'worthy'], phrases: ['I\'m not real', 'pretending to be', 'not worthy'], emotional: ['insecure', 'fraudulent'], behavioral: ['hides true self', 'fears discovery'] },
    { name: 'The Legalist', category: 'Conservative', keywords: ['rules', 'fair', 'right', 'law'], phrases: ['follow rules', 'what\'s fair', 'right way'], emotional: ['rigid', 'just'], behavioral: ['follows rules strictly', 'emphasizes fairness'] },
    { name: 'The Lover', category: 'Seducer', keywords: ['love', 'heart', 'passion', 'romance'], phrases: ['I love', 'my heart', 'passionate about'], emotional: ['passionate', 'romantic'], behavioral: ['expresses love', 'deeply romantic'] },
    { name: 'The Magician', category: 'Innovator', keywords: ['transform', 'change', 'magic', 'create'], phrases: ['transform this', 'create magic', 'change everything'], emotional: ['transformative', 'inspiring'], behavioral: ['creates change', 'inspires others'] },
    { name: 'The Mansplainer', category: 'Critic', keywords: ['actually', 'explain', 'understand', 'let me'], phrases: ['let me explain', 'you don\'t understand', 'actually'], emotional: ['condescending', 'superior'], behavioral: ['over-explains', 'talks down'] },
    { name: 'The Martyr', category: 'Caretaker', keywords: ['sacrifice', 'suffer', 'give up', 'pain'], phrases: ['I sacrifice', 'I suffer for', 'give up everything'], emotional: ['self-pitying', 'suffering'], behavioral: ['self-sacrificing', 'seeks recognition'] },
    { name: 'The Maverick', category: 'Renegade', keywords: ['different', 'independent', 'own way', 'unconventional'], phrases: ['my own way', 'think different', 'independent path'], emotional: ['independent', 'rebellious'], behavioral: ['goes against grain', 'unconventional'] },
    { name: 'The Misogynist', category: 'Conservative', keywords: ['women', 'females', 'girls', 'should'], phrases: ['women should', 'females are', 'girls need to'], emotional: ['hostile', 'superior'], behavioral: ['devalues women', 'sexist comments'] },
    { name: 'The Mr. Fix-It', category: 'Counselor', keywords: ['fix', 'solve', 'repair', 'solution'], phrases: ['I can fix', 'let me solve', 'the solution'], emotional: ['helpful', 'solution-focused'], behavioral: ['offers solutions', 'wants to repair'] },
    { name: 'The Narcissist', category: 'Deceiver', keywords: ['I', 'me', 'my', 'myself'], phrases: ['all about me', 'I deserve', 'my needs'], emotional: ['self-centered', 'grandiose'], behavioral: ['makes everything about self', 'lacks empathy'] },
    { name: 'The New Masculine', category: 'Innovator', keywords: ['vulnerable', 'authentic', 'emotional', 'evolved'], phrases: ['vulnerable strength', 'authentic man', 'emotionally evolved'], emotional: ['balanced', 'evolved'], behavioral: ['shows vulnerability', 'emotionally open'] },
    { name: 'The Opportunist', category: 'Deceiver', keywords: ['opportunity', 'advantage', 'benefit', 'use'], phrases: ['take advantage', 'opportunity for', 'what\'s in it'], emotional: ['calculating', 'selfish'], behavioral: ['exploits others', 'seeks personal gain'] },
    { name: 'The Passive-Aggressor', category: 'Possessor', keywords: ['fine', 'whatever', 'nothing', 'forget'], phrases: ['I\'m fine', 'whatever you want', 'forget it'], emotional: ['resentful', 'indirect'], behavioral: ['indirect anger', 'passive resistance'] },
    { name: 'The Perfectionist', category: 'Possessor', keywords: ['perfect', 'wrong', 'better', 'should'], phrases: ['not perfect', 'should be better', 'wrong way'], emotional: ['critical', 'demanding'], behavioral: ['finds flaws', 'impossible standards'] },
    { name: 'The Peter Pan', category: 'Avoidant', keywords: ['fun', 'young', 'grow up', 'responsibility'], phrases: ['let\'s have fun', 'don\'t grow up', 'avoid responsibility'], emotional: ['playful', 'immature'], behavioral: ['avoids responsibility', 'stays childlike'] },
    { name: 'The Philosopher', category: 'Innovator', keywords: ['think', 'meaning', 'deep', 'contemplate'], phrases: ['I think deeply', 'life\'s meaning', 'contemplate this'], emotional: ['contemplative', 'deep'], behavioral: ['deep thinking', 'seeks meaning'] },
    { name: 'The Possessive', category: 'Possessor', keywords: ['mine', 'belong', 'jealous', 'control'], phrases: ['you\'re mine', 'belong to me', 'I\'m jealous'], emotional: ['jealous', 'controlling'], behavioral: ['shows jealousy', 'controls partner'] },
    { name: 'The Pragmatist', category: 'Caretaker', keywords: ['practical', 'logical', 'realistic', 'sensible'], phrases: ['be practical', 'logically speaking', 'realistic approach'], emotional: ['logical', 'practical'], behavioral: ['practical solutions', 'logical approach'] },
    { name: 'The Preaching Critic', category: 'Critic', keywords: ['moral', 'right', 'wrong', 'should'], phrases: ['morally right', 'you should', 'wrong to do'], emotional: ['righteous', 'judgmental'], behavioral: ['preaches morality', 'judges others'] },
    { name: 'The Projector', category: 'Avoidant', keywords: ['you', 'your fault', 'because of', 'blame'], phrases: ['your fault', 'because of you', 'you make me'], emotional: ['blaming', 'defensive'], behavioral: ['blames others', 'projects issues'] },
    { name: 'The Provocateur', category: 'Renegade', keywords: ['drama', 'stir', 'chaos', 'provoke'], phrases: ['stir things up', 'create drama', 'provoke reaction'], emotional: ['dramatic', 'chaotic'], behavioral: ['creates drama', 'stirs conflict'] },
    { name: 'The Righteous', category: 'Critic', keywords: ['righteous', 'moral', 'superior', 'better'], phrases: ['morally superior', 'I\'m righteous', 'better than'], emotional: ['superior', 'moral'], behavioral: ['acts superior', 'judges morally'] },
    { name: 'The Romantic Idealist', category: 'Seducer', keywords: ['soulmate', 'perfect love', 'fairy tale', 'romance'], phrases: ['my soulmate', 'perfect love', 'fairy tale romance'], emotional: ['romantic', 'idealistic'], behavioral: ['seeks perfect love', 'romantic expectations'] },
    { name: 'The Saboteur', category: 'Renegade', keywords: ['ruin', 'destroy', 'sabotage', 'mess up'], phrases: ['ruin everything', 'mess this up', 'sabotage success'], emotional: ['destructive', 'self-defeating'], behavioral: ['undermines relationships', 'creates chaos'] },
    { name: 'The Status Seeker', category: 'Deceiver', keywords: ['status', 'image', 'appearance', 'look'], phrases: ['for status', 'my image', 'how it looks'], emotional: ['image-conscious', 'superficial'], behavioral: ['focuses on appearance', 'seeks status'] },
    { name: 'The Stoic', category: 'Conservative', keywords: ['control', 'discipline', 'composed', 'strong'], phrases: ['stay composed', 'self-discipline', 'remain strong'], emotional: ['controlled', 'disciplined'], behavioral: ['emotionally controlled', 'stays composed'] },
    { name: 'The Stonewaller', category: 'Avoidant', keywords: ['silent', 'nothing', 'shut down', 'wall'], phrases: ['stay silent', 'nothing to say', 'shut down'], emotional: ['withdrawn', 'silent'], behavioral: ['shuts down', 'refuses communication'] },
    { name: 'The Traditionalist', category: 'Conservative', keywords: ['traditional', 'family', 'values', 'way'], phrases: ['traditional way', 'family values', 'the right way'], emotional: ['traditional', 'conservative'], behavioral: ['follows tradition', 'maintains values'] },
    { name: 'The Transactional Partner', category: 'Deceiver', keywords: ['give', 'take', 'exchange', 'deal'], phrases: ['what do I get', 'fair exchange', 'make a deal'], emotional: ['calculating', 'conditional'], behavioral: ['treats as transaction', 'conditional love'] },
    { name: 'The Trickster', category: 'Renegade', keywords: ['game', 'trick', 'play', 'joke'], phrases: ['just a game', 'play tricks', 'joking around'], emotional: ['playful', 'manipulative'], behavioral: ['plays games', 'uses humor to manipulate'] },
    { name: 'The Unattainable Lover', category: 'Seducer', keywords: ['distance', 'unavailable', 'mystery', 'reach'], phrases: ['keep distance', 'unavailable now', 'out of reach'], emotional: ['mysterious', 'distant'], behavioral: ['maintains distance', 'emotionally unavailable'] },
    { name: 'The Virtue Signaller', category: 'Critic', keywords: ['virtue', 'moral', 'values', 'cause'], phrases: ['my values', 'moral stance', 'virtue of'], emotional: ['performative', 'superior'], behavioral: ['displays values', 'moral superiority'] },
    { name: 'The White Knight', category: 'Guardian', keywords: ['save', 'rescue', 'help', 'protect'], phrases: ['I\'ll save you', 'rescue from', 'help you'], emotional: ['heroic', 'protective'], behavioral: ['rescues others', 'solves problems'] },
    { name: 'The Womaniser', category: 'Seducer', keywords: ['women', 'multiple', 'options', 'variety'], phrases: ['many women', 'keep options', 'variety of'], emotional: ['predatory', 'selfish'], behavioral: ['pursues multiple women', 'uses and discards'] }
  ]

  const filteredPatterns = allPatterns
    .filter(pattern => {
      if (filterBy === 'all') return true
      return pattern.category === filterBy
    })
    .filter(pattern =>
      pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'category') return a.category.localeCompare(b.category)
      return 0
    })

  const categories = [...new Set(allPatterns.map(p => p.category))].sort()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Archetype Linguistics</h2>
        <Button className="bg-teal-600 hover:bg-teal-700">
          Add Pattern
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search patterns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="name">Sort by Name</option>
          <option value="category">Sort by Category</option>
        </select>
      </div>

      <div className="space-y-1">
        {filteredPatterns.map((pattern, index) => (
          <div key={index} className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-medium text-gray-900">{pattern.name}</h3>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                {pattern.category}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-600">Keywords:</span>
                <p className="text-gray-600">{pattern.keywords.slice(0, 3).join(', ')}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Phrases:</span>
                <p className="text-gray-600">{pattern.phrases.slice(0, 2).join(', ')}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Emotions:</span>
                <p className="text-gray-600">{pattern.emotional.join(', ')}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Behaviors:</span>
                <p className="text-gray-600">{pattern.behavioral.slice(0, 2).join(', ')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500">{filteredPatterns.length} of {allPatterns.length} patterns</p>
    </div>
  )
}
function AIAssistant() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">AI Development Assistant</h2>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Button variant="outline" className="h-16 flex flex-col">
            <span className="font-medium">Generate Questions</span>
            <span className="text-xs text-gray-500">Create assessment scenarios</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col">
            <span className="font-medium">Test Language Analysis</span>
            <span className="text-xs text-gray-500">Check archetype detection</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col">
            <span className="font-medium">Expand Archetypes</span>
            <span className="text-xs text-gray-500">Add new archetype definitions</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col">
            <span className="font-medium">Improve Detection</span>
            <span className="text-xs text-gray-500">Refine language patterns</span>
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl mb-2">1️⃣</div>
              <h4 className="font-medium text-gray-900 mb-1">Create Assessment</h4>
              <p className="text-sm text-gray-600">Theme-based question sets</p>
            </div>
            <div>
              <div className="text-2xl mb-2">2️⃣</div>
              <h4 className="font-medium text-gray-900 mb-1">Define Archetypes</h4>
              <p className="text-sm text-gray-600">Language patterns for detection</p>
            </div>
            <div>
              <div className="text-2xl mb-2">3️⃣</div>
              <h4 className="font-medium text-gray-900 mb-1">AI Analysis</h4>
              <p className="text-sm text-gray-600">Automatic pattern matching</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">About "Prompt Library"</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-3">
            The "Prompt Library" contains instructions that tell the AI how to analyze user responses.
            It's separate from assessment questions.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Assessment Questions</h5>
              <p className="text-gray-600">What users see: "Your partner's ex wants to meet for coffee..."</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-1">AI Prompts</h5>
              <p className="text-gray-600">Instructions to AI: "Analyze response for Warrior patterns..."</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}