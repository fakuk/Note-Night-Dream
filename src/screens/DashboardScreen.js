// src/screens/DashboardScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Animated, StatusBar, TextInput, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import DreamCard from '../components/DreamCard';
import { COLORS } from '../utils/theme';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const { dreams, refreshDreams } = useApp();
  const [search, setSearch] = useState('');
  const fabScale  = useRef(new Animated.Value(1)).current;
  const fabGlow   = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', refreshDreams);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabGlow, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(fabGlow, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const fabShadowOpacity = fabGlow.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const fabShadowRadius  = fabGlow.interpolate({ inputRange: [0, 1], outputRange: [12, 28] });

  const filtered = search.trim()
    ? dreams.filter(d =>
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.story.toLowerCase().includes(search.toLowerCase()) ||
        d.category.toLowerCase().includes(search.toLowerCase())
      )
    : dreams;

  const handleFabPress = () => {
    Animated.sequence([
      Animated.spring(fabScale, { toValue: 0.88, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 1,    useNativeDriver: true }),
    ]).start(() => navigation.navigate('DreamEntry', { dream: null }));
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyMoon}>☽</Text>
      <Text style={styles.emptyTitle}>No dreams yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the glowing button below{'\n'}to record your first dream
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <View>
          <Text style={styles.headerLabel}>DREAM JOURNAL</Text>
          <Text style={styles.headerTitle}>Note Night Dream</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{dreams.length}</Text>
          <Text style={styles.statLabel}>Total Dreams</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {dreams.filter(d => d.category === 'Lucid').length}
          </Text>
          <Text style={styles.statLabel}>Lucid</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {dreams.filter(d => d.category === 'Nightmare').length}
          </Text>
          <Text style={styles.statLabel}>Nightmares</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search dreams…"
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          selectionColor={COLORS.neonBlue}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dream list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <DreamCard
            dream={item}
            onPress={() => navigation.navigate('DreamEntry', { dream: item })}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={filtered.length === 0 ? { flex: 1 } : { paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <Animated.View style={[
        styles.fabShadow,
        { shadowOpacity: fabShadowOpacity, shadowRadius: fabShadowRadius },
      ]}>
        <Animated.View style={{ transform: [{ scale: fabScale }] }}>
          <TouchableOpacity style={styles.fab} onPress={handleFabPress} activeOpacity={0.85}>
            <Text style={styles.fabIcon}>＋</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.neonBlue,
    letterSpacing: 3,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: 'serif',
    letterSpacing: 0.5,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    padding: 14,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.neonBlue,
    textShadowColor: COLORS.neonBlue,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.bgCardBorder,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.bgInput,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 18,
    color: COLORS.textMuted,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  searchClear: {
    fontSize: 14,
    color: COLORS.textMuted,
    padding: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyMoon: {
    fontSize: 64,
    color: COLORS.neonBlue,
    opacity: 0.4,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  fabShadow: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    shadowColor: COLORS.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 16,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.neonBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 32,
    color: '#0a0f1a',
    fontWeight: '300',
    lineHeight: 38,
  },
});
