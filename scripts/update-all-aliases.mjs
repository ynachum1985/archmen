#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rkqujvonllmxjkkkeqsy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrcXVqdm9ubGxteGpra2tlcXN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk4NzkyMCwiZXhwIjoyMDY2NTYzOTIwfQ.HAC2EBgssb8ruwStzXs6wXjawEllsGqVnIeY5dSdRMw'

const supabase = createClient(supabaseUrl, supabaseKey)

// Your Notion data with aliases
const archetypeAliases = [
  { name: "The Hero", aliases: ["The Savior", "The Warrior", "The Chivalrous Knight", "The Crusader", "The Rescuer", "The Courageous", "The Altruist"], weight: null },
  { name: "The Lover", aliases: ["The Romantic", "The Caregiver", "The Devoted", "The Sensualist", "The Empath", "The Passionate", "The Protector", "The Affectionate", "The Attentive Listener", "The Romantic Poet", "The Supportive Partner", "The Compassionate", "The Romantic Adventurer", "The Nurturer", "The Harmonizer", "The Generous"], weight: 3 },
  { name: "The Mr Fix-It", aliases: ["The Fixer", "The White Knight", "The Emotional Avoider", "The Rationaliser", "The Conflict Avoidant", "The Practical Focused", "The Solution Orientated", "The Minimiser", "The Problem Dismisser", "The Tactical Executor", "The Mechanic"], weight: 3 },
  { name: "The Maverick", aliases: ["The Rebel with a Cause", "The Maverick", "The Nonconformist", "The Revolutionary", "The Challenger", "The Idealist", "The Outlaw", "The Anarchist", "The Renegade"], weight: 4 },
  { name: "The Stoic", aliases: ["The Emotionally Unavailable", "The Emotional Rock", "The Steady Hand", "The Rational Thinker", "The Emotional Minimalist", "The Resilient Partner", "The Detached Observer", "The Composed Leader", "The Pragmatist", "The Self-Reliant Partner", "The Unflappable Partner", "The Zen-Like Partner", "The Objective Mediator"], weight: 5 },
  { name: "The Trickster", aliases: ["The Trickster", "The Clown", "The Fool", "The Satirist", "The Entertainer", "The Mischief-Maker", "The Joker", "The Performer"], weight: 3 },
  { name: "The Bad Boy", aliases: ["The RIsk Taker", "The Adventurer", "The Thrill-Seeker", "The Reckless Male", "The Adrenaline Junkie", "The Daredevil", "The Gambler", "The Rebel"], weight: 5 },
  { name: "The Empath", aliases: ["The Listener", "The Compassionate Male", "The intuitive Male", "The Healer", "The Caretaker", "The Nurturer", "The Mindful Male", "The Emotional Laborer"], weight: 3 },
  { name: "The Pragmatist", aliases: ["The Pragmatist", "The Analyst", "The Problem Solver", "The Strategist", "The Organiser", "The Realist Optimist", "The Decision Maker", "The Task Manager", "The Intellectual", "The Thinker"], weight: 2 },
  { name: "The Clueless Partner", aliases: ["The Lovable Fool", "The Absent-Minded Professor", "The Well-Meaning Bumbler", "The Oblivious Partner", "The Gentle Giant"], weight: 5 },
  { name: "The Romantic Idealist", aliases: ["The Creative", "The Dreamer", "The Passionate Lover", "The Sentimentalist", "The Devoted Partner", "The Tender Heart", "The Poet", "The Idealistic Lover"], weight: 4 },
  { name: "The Alpha Male", aliases: ["The Hyper Masculine", "The Hegemonic Male", "The Macho", "The High Achiever", "The Dominant", "The Tough Guy", "The Machismo", "The Bully", "The Neanderthal", "The Caveman", "The Roughneck"], weight: 7 },
  { name: "The Womaniser", aliases: ["The Player", "The Casanova", "The Heartbreaker", "The Playboy", "The Lothario", "The Commitment-Phobe", "The Machiavellian Lover", "The Seducer", "The Flirt", "The Charmer", "The Sexual Initiator", "The Perpetual Bachelor", "The Pick Up Artist"], weight: 7 },
  { name: "The Perfectionist", aliases: ["The Over-Achiever", "The Ambition-Driven Neglecter", "The Perfectionist", "The Standards Setter", "The Compulsive Worker", "The Workaholic", "The High Performer", "The Relentless Striver", "The Ambitious Go-Getter", "The Achievement-Oriented", "The Goal-Driven", "The Success-Driven", "The Competitive Achiever"], weight: 4 },
  { name: "The Transactional Partner", aliases: ["The Provider with Conditions", "The Conditional Caregiver", "The Manipulative Provider", "The Paternalistic Partner", "The Controlling Benefactor", "The Bargainer", "The Conditional Lover", "The Power Broker", "The Tactician"], weight: 5 },
  { name: "The Legalist", aliases: ["The Rule Enforcer", "The Law Keeper", "The Justice Seeker", "The Black-and-White Thinker", "The Ethical Enforcer", "The Moral Arbitrator", "The Principle Protector", "The Accountability Keeper"], weight: 6 },
  { name: "The Hedonist", aliases: ["The Sensualist", "The Pleasure Seeker", "The Epicurean", "The Party Animal", "The Self-Indulgent"], weight: 5 },
  { name: "The Stonewaller", aliases: ["The Silent Treatment Giver", "The Withdrawer", "The Emotional Shut Downer", "The Conflict Dodger", "The Denier", "The Dismmiser", "The Ignorer"], weight: 7 },
  { name: "The Righteous", aliases: ["The Truth Teller", "The Moral Guide", "The Whistleblower", "The Purist", "The Self-Superior", "The Judge", "The Idealist", "The Moral Enforcer", "The Holier-than-Thou", "The Ethicist", "The Moral Teacher", "The Know-It-All", "The Preacher", "The Moral High Grounder", "The Opinionated Partner", "The Self-Proclaimed Authority", "The Righteous Defender", "The Perfectionist", "The Moral Crusader", "The Ideologue"], weight: 6 },
  { name: "The Narcissist", aliases: ["The Manipulator", "The Gaslighter", "The Control Freak", "The Emotional Abuser", "The Toxic Partner", "The Puppet Master", "The Deceiver", "The Attention Seeker", "The Emotional Blackmailer", "The Ultimatum Giver", "The Punisher"], weight: 7 },
  { name: "The Martyr", aliases: ["The Sacrificer", "The Over-Giver", "The Unseen Worker", "The Caregiver", "The Guilt Tripper", "The Noble Sufferer", "The Duty-Bound Partner", "The Passive-Agressive Martyr", "The Emotional Martyr"], weight: 6 },
  { name: "The Breadwinner", aliases: ["The Provider", "The Supporter", "The Caregiver", "The Manager", "The Responsible Male", "The Decision Maker", "The Hunter"], weight: 3 },
  { name: "The Guru", aliases: ["The Priest", "The Sanctimonious Partner", "The Protector of Tradition", "The Confessor", "The Missionary", "The Gatekeeper", "The Ascetic", "The Purist", "The Crusader", "The Spiritual Authority", "The Spiritual Teacher"], weight: 5 },
  { name: "The Passive-Aggressor", aliases: ["The Sarcastic Partner", "The Silent Treatment Giver", "The Subtle Saboteur", "The Grudge Holder", "The Victim", "The Cynic", "The Complainer", "The Jaded Partner", "The Bitter Partner", "The Resentful", "The Discontented Partner", "The Unforgiving Partner", "The Frustrated Partner", "The Aggrieved"], weight: 7 },
  { name: "The Possessive", aliases: ["The Possessor", "The Paranoid", "The Distrustful", "The Anxious", "The Overly Cautious", "The Conspiracy Theorist", "The Insecure Partner", "The Hypervigilant", "The Fearful", "The Over-Analytical"], weight: 6 },
  { name: "The Compulsive Liar", aliases: ["The Pathological Liar", "The Fantasist", "The Fraudster", "The Deceiver"], weight: 6 },
  { name: "The Hypocrite", aliases: ["The Double Standarder", "The Privileged", "The Entitled", "The Two Faced", "The Pretender", "The Discrepant", "The False Prophet", "The Image-Conscious", "The Masker"], weight: 7 },
  { name: "The Opportunist", aliases: ["The User", "The Manipulator", "The Exploiter", "The Profiteer", "The Opportunistic Charmer", "The Emotional Leverager", "The Manipulative Provider", "The Coercer", "The Resourceful Taker", "The Beneficiary", "The Advantage Seeker", "The Exploitative Partner", "The Opportunistic Provider", "The Advantageous Networker"], weight: 7 },
  { name: "The Misogynist", aliases: ["The Chauvinist", "The Pig", "The Sexist", "The Authoritarian Male", "The Patriarch", "The Dominator"], weight: 7 },
  { name: "The Saboteur", aliases: ["The Masochist", "The Fearful Avoidant", "The Self-Saboteur", "The Cynic", "The Fault Finder", "The Emotional Saboteur", "The Self-Fulfilling Prophet", "The Perpetual Tester", "The Pain Seeker", "The Conflict Magnet", "The Emotional Masochist", "The Suffering Idealist"], weight: 7 },
  { name: "The New Masculine", aliases: ["The Empath", "The Compassionate", "The Modern Man", "The Emotional Adventurer", "The Progressive Gentleman", "The Empowered Partner", "The Authentic Man", "The Compassionate Leader", "The Equal Partner", "The Reflective Man", "The Supportive Ally", "The Nurturing Provider", "The Open-Minded", "The Growth Oriented", "The Tolerant Partner", "The Stay-at-Home Dad", "The Supportive Spouse"], weight: 2 },
  { name: "The Idealist", aliases: ["The Happy-Go-Lucky", "The Idealist", "The Dreamer", "The Encourager", "The Cheerleader", "The Believer", "The Positivity Seeker", "The Resilient", "The Visionary", "The Optimist"], weight: 4 },
  { name: "The Harmonizer", aliases: ["The Mediator", "The Peacemaker", "The Negotiator", "The Harmonizer", "The Emotional Shepherd", "The Emotional Manager", "The Facilitator"], weight: 2 },
  { name: "The Advocate", aliases: ["The Protector", "The Champion", "The Motivator", "The Ally", "The Ambitious Male", "The Confidant", "The Counselor", "The Trusted Advisor", "The Righteous Crusader", "The Ethical Leader", "The Noble Knight", "The Truth Seeker", "The Empowerer", "The Defender", "The Encourager"], weight: 3 },
  { name: "The Mansplainer", aliases: ["The Patroniser", "The Know-It-All", "The Over-compensator", "The Condescendor", "The Arrogant Male", "The Over-Explainer", "The Instructive Partner"], weight: 5 },
  { name: "The Avoidant", aliases: ["The Ghoster", "The Independent", "The Escapist", "The Distractor", "The Procrastinator", "The Dreamer", "The Denier", "The Workaholic", "The Fantasy Lover", "The Recluse", "The Perpetual Optimist", "The Hedonist"], weight: 6 },
  { name: "The Traditionalist", aliases: ["The Benevolent Sexist", "The Chivalrous Man", "The Benevolent Patriarch", "The Overprotective Man", "The Rescuer", "The Patronising Mentor", "The Apologist", "The Androcentrist", "The Hierarchist", "The Old Fashioned", "The Defender of the Status Quo", "The Conservative", "The Conventionalist"], weight: 5 },
  { name: "The Bloke", aliases: ["The Dude", "The Surfer", "The Guy", "The Lad", "The Everyman", "The Regular Guy", "The Working-Class Hero"], weight: 4 },
  { name: "The Magician", aliases: ["The Visionary", "The Mystic", "The Alchemist", "The Charmer", "The Innovator", "The Inspirer", "The Creative", "The Ritualist", "The Sage", "The Guru"], weight: 5 },
  { name: "The Advice Giver", aliases: ["The Coach", "The Mentor", "The Advisor", "The Problem Solver", "The Guru", "The Counselor", "The Fixer", "The Know-it-all", "The Elder", "The Director"], weight: 4 },
  { name: "The Gentleman", aliases: ["The Chivalrous Man", "The Polished Suave", "The Respectful Partner", "The Cultured Companion", "The Romantic Traditionalist", "The Provider of Comfort", "The Gracious Negotiator", "The Honorable Gentleman", "The Attentive Listener", "The Courteous Romantic"], weight: 3 },
  { name: "The Empowered Man", aliases: ["The Boundary Setter", "The Assertive Communicator", "The Self-Respecting Partner", "The Fair Negotiator", "The Respectful Partner", "The Mindful Listener", "The Initiator of Serious Conversations"], weight: 2 },
  { name: "The Projector", aliases: ["The Projector", "The Blame-Shifter", "The Scapegoater", "The Defensive Man", "The Rationalist", "The Guilt Tripper", "The Deflector", "The Minimizer", "The Rational-Emotional Hybrid", "The Victim Blamer", "The Justifier"], weight: 6 },
  { name: "The Peter Pan", aliases: ["The Perpetual Adolescent", "The Man-Child", "The Mama's Boy", "The Escapist", "The Procrastinator", "The Overgrown Child", "The Emotional Dependent", "The Infantilizer", "The Non-Contributor", "The Entitled Partner"], weight: 5 },
  { name: "The Virtue Signaller", aliases: ["The Moral Show-Off", "The Publicly Pious", "The Compassionate Self-Promoter", "The Ethical Dresser", "The Self-Righteous Activist", "The Guilt-Free Exemplar", "The Ethical Trendsetter", "The Social Justice Warrior", "The Altruistic Image-Builder", "The Moral Gatekeeper"], weight: 4 },
  { name: "The Status Seeker", aliases: ["The Trophy Hunter", "The Prestige Partner", "The Hierarchy Climber", "The Image Conscious Partner", "The Social Networker", "The Wealth-Driven Partner", "The Celebrity Associate", "The Achievement Leverager", "The Elite Circle Member", "The Status Enhancer", "The Image Projector", "The Status Symbol Partner", "The Glamour Seeker"], weight: 4 },
  { name: "The Philosopher", aliases: ["The Reflective Thinker", "The Contemplative Partner", "The Value Seeker", "The Deep Thinker", "The Existential Explorer", "The Thoughtful Advisor", "The Meaning-Seeker", "The Wise Companion"], weight: 3 },
  { name: "The Imposter", aliases: ["The Fraudster", "The Con Artist", "The Pretender", "The Manipulator", "The Schemer", "The Deceiver", "The Charlatan", "The Self-Aggrandizer", "The Phoney", "The Spin Doctor", "The Flim-Flam Artist", "The Swindler", "The Pretentious"], weight: 7 },
  { name: "The White Knight", aliases: ["The Rescuer", "The Savior", "The Protector", "The Guardian", "The Fixer", "The Defender", "The Champion", "The Helper", "The Redeemer", "The Martyr"], weight: 5 },
  { name: "The Provocateur", aliases: ["The Agitator", "The Instigator", "The Boundary Pusher"], weight: 6 },
  { name: "The Defeatist", aliases: ["The Pessimist", "The Worrier", "The Cynic", "The Alarmist", "The Victim", "The Helpless", "The Self-Pitying Partner", "The Perpetual Sufferer", "The Perpetual Victim"], weight: 5 },
  { name: "The Emotional Dependent", aliases: ["The Energy Drainer", "The Drama Magnet", "The Crisis Junkie", "The Energy Vampire", "The Insecure Man", "The Needy Partner", "The Co-Dependent", "The Reliant"], weight: 6 },
  { name: "The Emotional Coach", aliases: ["The Emotional Guide", "The Intuitive Mentor", "The Heart-Centered Advisor", "The Mindful Coach", "The Supportive Guide", "The Reflective Mentor"], weight: 2 },
  { name: "The Commander", aliases: ["The Strategist", "The Planner", "The Tactician", "The Problem-Solver", "The Analyst", "The Schemer", "The Director", "The Leader", "The Controller", "The Commander", "The Orchestrator", "The Decision-Maker", "The Authority Figure"], weight: 6 },
  { name: "The Preaching Critic", aliases: ["Fault-Finding Moralizer", "The Judgmental Lecturer", "The Sanctimonious Critic", "The Self-Righteous Scold", "The Holier-Than-Thou Reviewer", "The Condescending Judge"], weight: 6 },
  { name: "The Unattainable Lover", aliases: ["The Elusive Partner", "The Distant Romantic", "The Mysterious Seducer", "The Enigmatic Heartbreaker", "The Unreachable Flame", "The Out-of-Reach Lover", "The Unattainable Fantasy"], weight: 6 }
]

async function updateArchetypes() {
  console.log('🎭 Updating all archetypes with aliases from Notion...\n')
  
  let updated = 0
  let notFound = 0
  let errors = 0
  
  for (const item of archetypeAliases) {
    try {
      // Find the archetype by name
      const { data: existing, error: findError } = await supabase
        .from('enhanced_archetypes')
        .select('id, name, impact_score')
        .eq('name', item.name)
        .single()
      
      if (findError || !existing) {
        console.log(`⚠️  Not found: ${item.name}`)
        notFound++
        continue
      }
      
      // Update with aliases and weight
      const updateData = {
        alternative_names: item.aliases,
        impact_score: item.weight || existing.impact_score
      }
      
      const { error: updateError } = await supabase
        .from('enhanced_archetypes')
        .update(updateData)
        .eq('id', existing.id)
      
      if (updateError) {
        console.error(`❌ Error updating ${item.name}:`, updateError.message)
        errors++
      } else {
        console.log(`✅ ${item.name} (${item.aliases.length} aliases, weight: ${item.weight || existing.impact_score})`)
        updated++
      }
      
    } catch (error) {
      console.error(`❌ Exception for ${item.name}:`, error.message)
      errors++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log(`✅ Updated: ${updated}`)
  console.log(`⚠️  Not found: ${notFound}`)
  console.log(`❌ Errors: ${errors}`)
  console.log(`📊 Total processed: ${archetypeAliases.length}`)
  console.log('='.repeat(60))
}

updateArchetypes()

