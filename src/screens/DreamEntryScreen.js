// src/screens/DreamEntryScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, StatusBar, Animated, KeyboardAvoidingView,
  Platform, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, CATEGORIES, CATEGORY_COLORS } from '../utils/theme';
import { saveDream, deleteDream, createDream } from '../utils/storage';
import { useApp } from '../context/AppContext';
import CategoryBadge from '../components/CategoryBadge';

const { width } = Dimensions.get('window');

const GlassInput = ({ label, style, ...props }) => (
  <View style={inputStyles.wrap}>
    <Text style={inputStyles.label}>{label}</Text>
    <TextInput
      style={[inputStyles.input, style]}
      placeholderTextColor={COLORS.textMuted}
      selectionColor={COLORS.neonBlue}
      {...props}
    />
  </View>
);

const inputStyles = StyleSheet.create({
  wrap: { marginBottom: 18 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.neonBlue,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
});

export default function DreamEntryScreen({ route, navigation }) {
  const { refreshDreams } = useApp();
  const existing = route.params?.dream;

  const [title,    setTitle]    = useState(existing?.title    || '');
  const [story,    setStory]    = useState(existing?.story    || '');
  const [date,     setDate]     = useState(existing?.date     || new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(existing?.category || 'Other');
  const [saving,   setSaving]   = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please give your dream a title.');
      return;
    }
    setSaving(true);
    const dream = createDream({
      id: existing?.id,
      title: title.trim(),
      story: story.trim(),
      date,
      category,
      createdAt: existing?.createdAt,
    });
    const ok = await saveDream(dream);
    setSaving(false);
    if (ok) {
      await refreshDreams();
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Could not save dream. Please try again.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Dream',
      'This dream will be permanently deleted. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            await deleteDream(existing.id);
            await refreshDreams();
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{existing ? 'Edit Dream' : 'New Dream'}</Text>
          {existing ? (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteIcon}>🗑</Text>
            </TouchableOpacity>
          ) : <View style={{ width: 40 }} />}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}>
            <GlassInput
              label="DREAM TITLE"
              placeholder="What was it called?"
              value={title}
              onChangeText={setTitle}
            />

            <GlassInput
              label="DATE"
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
              keyboardType="numeric"
            />

            {/* Category selector */}
            <View style={styles.catWrap}>
              <Text style={styles.catLabel}>CATEGORY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.catPill,
                      {
                        backgroundColor: CATEGORY_COLORS[cat].bg,
                        borderColor: category === cat ? CATEGORY_COLORS[cat].border : 'transparent',
                        borderWidth: category === cat ? 1.5 : 0,
                      },
                    ]}
                  >
                    <Text style={[styles.catPillText, { color: CATEGORY_COLORS[cat].text }]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <GlassInput
              label="DREAM STORY"
              placeholder="Describe everything you remember… the vivid colors, the people, the feeling…"
              value={story}
              onChangeText={setStory}
              multiline
              numberOfLines={10}
              style={styles.storyInput}
              textAlignVertical="top"
            />

            {/* Word count */}
            <Text style={styles.wordCount}>
              {story.trim() ? story.trim().split(/\s+/).length : 0} words
            </Text>

            {/* Save button */}
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              <View style={styles.saveBtnInner}>
                <Text style={styles.saveBtnText}>{saving ? 'Saving…' : '✦  Save Dream'}</Text>
              </View>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgCardBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: COLORS.neonBlue,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'serif',
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,60,110,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,60,110,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 16,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  catWrap: { marginBottom: 18 },
  catLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.neonBlue,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  catScroll: { flexDirection: 'row' },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  catPillText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  storyInput: {
    minHeight: 180,
    paddingTop: 12,
    lineHeight: 22,
  },
  wordCount: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: -10,
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  saveBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: COLORS.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 10,
  },
  saveBtnDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  saveBtnInner: {
    backgroundColor: COLORS.neonBlue,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0a0f1a',
    letterSpacing: 1,
  },
});
