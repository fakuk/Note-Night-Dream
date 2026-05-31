// src/components/CategoryBadge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CATEGORY_COLORS } from '../utils/theme';

export default function CategoryBadge({ category, small = false }) {
  const palette = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;

  return (
    <View style={[
      styles.badge,
      { backgroundColor: palette.bg, borderColor: palette.border },
      small && styles.badgeSmall,
    ]}>
      <Text style={[styles.text, { color: palette.text }, small && styles.textSmall]}>
        {category}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 10,
  },
});
    
