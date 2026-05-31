// src/components/DreamCard.js
import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { COLORS, CATEGORY_COLORS } from '../utils/theme';
import CategoryBadge from './CategoryBadge';

export default function DreamCard({ dream, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const palette = CATEGORY_COLORS[dream.category] || CATEGORY_COLORS.Other;

  const handlePressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true }).start();

  const snippet = dream.story
    ? dream.story.replace(/\n/g, ' ').substring(0, 100) + (dream.story.length > 100 ? '…' : '')
    : 'No story recorded yet…';

  const formattedDate = (() => {
    try {
      return new Date(dream.date + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    } catch {
      return dream.date;
    }
  })();

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        {/* Left accent bar */}
        <View style={[styles.accentBar, { backgroundColor: palette.border }]} />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.date}>{formattedDate}</Text>
            <CategoryBadge category={dream.category} small />
          </View>
          <Text style={styles.title} numberOfLines={1}>{dream.title || 'Untitled Dream'}</Text>
          <Text style={styles.snippet} numberOfLines={2}>{snippet}</Text>
        </View>

        {/* Subtle glow overlay */}
        <View style={[styles.glowOverlay, { backgroundColor: palette.bg }]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  accentBar: {
    width: 3,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0,
    width: 80,
    opacity: 0.15,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  snippet: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
});
