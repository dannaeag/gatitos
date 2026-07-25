import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Transaction } from '../types';

export interface ClanCharacter {
  id: string;
  name: string;
  role: string;
  quote: string;
  minStreak: number;
  image: any;
  color: string;
  badge: string;
}

export const CLAN_CHARACTERS: ClanCharacter[] = [
  {
    id: 'guardian',
    name: 'Líder Guardián 🛡️',
    role: 'Guardián del Tesoro',
    quote: 'Protegiendo cada peso con garras y dientes.',
    minStreak: 1,
    image: require('../../assets/cat_black_hugging.png'),
    color: '#38BDF8',
    badge: 'Racha Día 1',
  },
  {
    id: 'contable',
    name: 'Michi Contable 📊',
    role: 'Auditor Financiero',
    quote: 'Ningún gasto hormiga se me escapa de los números.',
    minStreak: 3,
    image: require('../../assets/cat_black_serious.png'),
    color: '#F59E0B',
    badge: 'Racha Día 3',
  },
  {
    id: 'inversionista',
    name: 'Michi Millonario 🤑',
    role: 'Especialista en Ahorro',
    quote: '¡El dinero trabaja para nosotros mientras dormimos!',
    minStreak: 7,
    image: require('../../assets/cat_black_dollar.png'),
    color: '#10B981',
    badge: 'Racha Día 7',
  },
  {
    id: 'sabio',
    name: 'Michi Satisfecho 😋',
    role: 'Maestro de la Abundancia',
    quote: 'Sabor a tranquilidad y finanzas equilibradas.',
    minStreak: 14,
    image: require('../../assets/cat_black_licking.png'),
    color: '#EC4899',
    badge: 'Racha Día 14',
  },
  {
    id: 'legendario',
    name: 'Michi Místico Dorado 👑✨',
    role: 'Leyenda Financiera',
    quote: 'Dominio absoluto del presupuesto. ¡Poder Felino Supremo!',
    minStreak: 30,
    image: require('../../assets/cat_black_wrapped.png'),
    color: '#A855F7',
    badge: 'Racha Día 30',
  },
];

/**
 * Calculates consecutive daily active streak based on transactions array.
 */
export function calculateDailyStreak(transactions: Transaction[]): number {
  if (!transactions || transactions.length === 0) {
    return 3; // Demostración por defecto para mostrar múltiples personajes
  }

  const uniqueDays = new Set<string>();
  transactions.forEach((tx) => {
    const dateStr = new Date(tx.date).toISOString().split('T')[0];
    uniqueDays.add(dateStr);
  });

  const today = new Date();
  let streak = 0;
  let curr = new Date(today);

  // Allow today or yesterday as the start of an active streak
  let currStr = curr.toISOString().split('T')[0];
  if (!uniqueDays.has(currStr)) {
    curr.setDate(curr.getDate() - 1);
    currStr = curr.toISOString().split('T')[0];
  }

  while (uniqueDays.has(currStr)) {
    streak++;
    curr.setDate(curr.getDate() - 1);
    currStr = curr.toISOString().split('T')[0];
  }

  return Math.max(streak, 1);
}

interface MichiClanStreakProps {
  transactions: Transaction[];
  selectedCatId?: string;
  onSelectCat?: (cat: ClanCharacter) => void;
}

export const MichiClanStreak: React.FC<MichiClanStreakProps> = ({
  transactions,
  selectedCatId,
  onSelectCat,
}) => {
  const streak = calculateDailyStreak(transactions);
  const [activeTab, setActiveTab] = useState<string>(selectedCatId || 'guardian');

  // Filter unlocked characters
  const unlockedCount = CLAN_CHARACTERS.filter((c) => streak >= c.minStreak).length;

  // Animations for floating characters
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createLoop = (anim: Animated.Value, toVal: number, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: toVal, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );

    const l1 = createLoop(floatAnim1, -8, 1400);
    const l2 = createLoop(floatAnim2, -12, 1800);
    const l3 = createLoop(floatAnim3, -6, 1600);

    l1.start();
    l2.start();
    l3.start();

    return () => {
      l1.stop();
      l2.stop();
      l3.stop();
    };
  }, []);

  const activeCharacter = CLAN_CHARACTERS.find((c) => c.id === activeTab) || CLAN_CHARACTERS[0];
  const isUnlocked = streak >= activeCharacter.minStreak;

  return (
    <View style={styles.container}>
      {/* Header Racha Display */}
      <View style={styles.streakHeaderCard}>
        <View style={styles.streakBadgeContainer}>
          <Text style={styles.fireEmoji}>🔥</Text>
          <View>
            <Text style={styles.streakTitle}>Racha Activa: {streak} {streak === 1 ? 'Día' : 'Días'}</Text>
            <Text style={styles.streakSubText}>
              {unlockedCount} de {CLAN_CHARACTERS.length} Michis desbloqueados en tu escuadrón
            </Text>
          </View>
        </View>

        {/* Progress Bar towards next character unlock */}
        {unlockedCount < CLAN_CHARACTERS.length && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                Siguiente personaje: {CLAN_CHARACTERS[unlockedCount].name}
              </Text>
              <Text style={styles.progressPct}>
                {streak} / {CLAN_CHARACTERS[unlockedCount].minStreak} días
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min((streak / CLAN_CHARACTERS[unlockedCount].minStreak) * 100, 100)}%`,
                    backgroundColor: CLAN_CHARACTERS[unlockedCount].color,
                  },
                ]}
              />
            </View>
          </View>
        )}
      </View>

      {/* Escuadrón Visual Showcase (Multiple Characters Floating) */}
      <View style={styles.squadStage}>
        <Text style={styles.stageTitle}>🐾 Tu Escuadrón Michi por Racha 🐾</Text>
        <View style={styles.charactersGrid}>
          {CLAN_CHARACTERS.map((char, index) => {
            const charUnlocked = streak >= char.minStreak;
            const anim = index % 3 === 0 ? floatAnim1 : index % 3 === 1 ? floatAnim2 : floatAnim3;

            return (
              <TouchableOpacity
                key={char.id}
                style={[
                  styles.charCard,
                  activeTab === char.id && styles.selectedCharCard,
                  !charUnlocked && styles.lockedCharCard,
                ]}
                onPress={() => {
                  setActiveTab(char.id);
                  if (onSelectCat) onSelectCat(char);
                }}
              >
                <Animated.View
                  style={[
                    styles.charImageWrapper,
                    charUnlocked && { transform: [{ translateY: anim }] },
                  ]}
                >
                  <Image
                    source={char.image}
                    style={[
                      styles.charImage,
                      !charUnlocked && styles.silhouetteImage,
                    ]}
                    resizeMode="contain"
                  />
                  {!charUnlocked && (
                    <View style={styles.lockOverlay}>
                      <Text style={styles.lockIcon}>🔒</Text>
                      <Text style={styles.lockText}>{char.badge}</Text>
                    </View>
                  )}
                </Animated.View>

                <Text style={[styles.charName, { color: charUnlocked ? char.color : '#64748B' }]} numberOfLines={1}>
                  {char.name.split(' ')[0]} {char.name.split(' ')[1] || ''}
                </Text>
                <View style={[styles.roleBadge, { backgroundColor: charUnlocked ? `${char.color}20` : '#33415550' }]}>
                  <Text style={[styles.roleBadgeText, { color: charUnlocked ? char.color : '#94A3B8' }]}>
                    {charUnlocked ? char.role.split(' ')[0] : `Día ${char.minStreak}`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected Character Profile Detail */}
      <View style={[styles.detailCard, { borderColor: isUnlocked ? activeCharacter.color : '#334155' }]}>
        <View style={styles.detailHeader}>
          <Text style={[styles.detailTitle, { color: isUnlocked ? activeCharacter.color : '#94A3B8' }]}>
            {activeCharacter.name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: isUnlocked ? `${activeCharacter.color}30` : '#334155' }]}>
            <Text style={[styles.statusBadgeText, { color: isUnlocked ? activeCharacter.color : '#94A3B8' }]}>
              {isUnlocked ? '✨ En Escuadrón' : `🔒 Req. ${activeCharacter.minStreak} Días`}
            </Text>
          </View>
        </View>

        <Text style={styles.detailRole}>Rol: {activeCharacter.role}</Text>
        <Text style={styles.detailQuote}>"{activeCharacter.quote}"</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  streakHeaderCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginBottom: 16,
  },
  streakBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fireEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  streakTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  streakSubText: {
    color: '#38BDF8',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '500',
  },
  progressPct: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  squadStage: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  stageTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  charactersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  charCard: {
    width: '30%',
    minWidth: 90,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 14,
    padding: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  selectedCharCard: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  lockedCharCard: {
    opacity: 0.75,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  charImageWrapper: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  charImage: {
    width: '100%',
    height: '100%',
  },
  silhouetteImage: {
    tintColor: '#334155',
    opacity: 0.5,
  },
  lockOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 18,
  },
  lockText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  charName: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  detailCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailRole: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailQuote: {
    color: '#F8FAFC',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
