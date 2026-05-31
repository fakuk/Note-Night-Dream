// src/screens/SettingsScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, StatusBar, ScrollView, Animated, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { COLORS, CATEGORY_COLORS } from '../utils/theme';
import { exportData, importData, savePin } from '../utils/storage';
import { useApp } from '../context/AppContext';

export default function SettingsScreen({ navigation }) {
  const { dreams, refreshDreams, setAuthenticated, pin } = useApp();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [status,    setStatus]    = useState(null);   // { type: 'success'|'error', msg }

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const showStatus = (type, msg) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 4000);
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      setExporting(true);
      const json     = await exportData();
      const filename = `NoteNightDream_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
      const fileUri  = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Save your dream backup',
          UTI: 'public.json',
        });
        showStatus('success', `Backup exported — ${dreams.length} dreams`);
      } else {
        showStatus('success', `Backup saved to app folder:\n${filename}`);
      }
    } catch (e) {
      console.error('Export error:', e);
      showStatus('error', 'Export failed: ' + (e.message || 'Unknown error'));
    } finally {
      setExporting(false);
    }
  };

  // ── Import ─────────────────────────────────────────────────────────────────
  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const json  = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      Alert.alert(
        'Restore Backup',
        'This will replace ALL current dream entries with the backup data. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restore',
            style: 'destructive',
            onPress: async () => {
              try {
                setImporting(true);
                const count = await importData(json);
                await refreshDreams();
                showStatus('success', `Restored ${count} dreams successfully!`);
              } catch (e) {
                showStatus('error', 'Invalid backup file: ' + (e.message || 'Unknown format'));
              } finally {
                setImporting(false);
              }
            },
          },
        ]
      );
    } catch (e) {
      console.error('Import error:', e);
      showStatus('error', 'Could not open file: ' + (e.message || 'Unknown error'));
    }
  };

  // ── Dream stats breakdown ──────────────────────────────────────────────────
  const categoryStats = Object.entries(
    dreams.reduce((acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* Status toast */}
          {status && (
            <View style={[
              styles.statusBar,
              status.type === 'success' ? styles.statusSuccess : styles.statusError,
            ]}>
              <Text style={styles.statusText}>
                {status.type === 'success' ? '✓  ' : '✕  '}{status.msg}
              </Text>
            </View>
          )}

          {/* Stats card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>DREAM ARCHIVE</Text>
            <View style={styles.bigStat}>
              <Text style={styles.bigStatNumber}>{dreams.length}</Text>
              <Text style={styles.bigStatLabel}>Total Dreams Recorded</Text>
            </View>
            {categoryStats.length > 0 && (
              <View style={styles.breakdownWrap}>
                {categoryStats.map(([cat, count]) => {
                  const palette = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;
                  const pct = Math.round((count / dreams.length) * 100);
                  return (
                    <View key={cat} style={styles.breakdownRow}>
                      <Text style={[styles.breakdownCat, { color: palette.text }]}>{cat}</Text>
                      <View style={styles.breakdownBarWrap}>
                        <View style={[
                          styles.breakdownBar,
                          { width: `${pct}%`, backgroundColor: palette.border },
                        ]} />
                      </View>
                      <Text style={styles.breakdownCount}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Backup & Restore */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>BACKUP & RESTORE</Text>
            <Text style={styles.sectionDesc}>
              Export your dreams to a JSON file you can store anywhere — cloud, email, or external drive.
            </Text>

            {/* Export */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleExport}
              disabled={exporting || importing}
              activeOpacity={0.8}
            >
              <View style={styles.actionBtnLeft}>
                <Text style={styles.actionBtnIcon}>☁</Text>
                <View>
                  <Text style={styles.actionBtnTitle}>Export Backup</Text>
                  <Text style={styles.actionBtnSub}>Save {dreams.length} dreams as JSON</Text>
                </View>
              </View>
              {exporting
                ? <ActivityIndicator color={COLORS.neonBlue} />
                : <Text style={styles.actionArrow}>→</Text>
              }
            </TouchableOpacity>

            {/* Import */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSecondary]}
              onPress={handleImport}
              disabled={exporting || importing}
              activeOpacity={0.8}
            >
              <View style={styles.actionBtnLeft}>
                <Text style={styles.actionBtnIcon}>📂</Text>
                <View>
                  <Text style={[styles.actionBtnTitle, { color: COLORS.neonMint }]}>Import Backup</Text>
                  <Text style={styles.actionBtnSub}>Restore from a JSON backup file</Text>
                </View>
              </View>
              {importing
                ? <ActivityIndicator color={COLORS.neonMint} />
                : <Text style={[styles.actionArrow, { color: COLORS.neonMint }]}>→</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Security */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>SECURITY</Text>
            <TouchableOpacity
              style={styles.securityRow}
              onPress={() => {
                Alert.alert('Change PIN', 'You will be logged out to set a new PIN.', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Continue',
                    onPress: async () => {
                      await savePin('');       // clear pin so PinScreen enters set-pin mode
                      setAuthenticated(false);
                    },
                  },
                ]);
              }}
            >
              <Text style={styles.securityIcon}>🔐</Text>
              <View style={styles.securityText}>
                <Text style={styles.securityTitle}>Change PIN</Text>
                <Text style={styles.securitySub}>Reset your 4-digit unlock code</Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Lock */}
          <TouchableOpacity
            style={styles.lockBtn}
            onPress={() => {
              Alert.alert('Lock App', 'Lock the app and return to PIN screen?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Lock', onPress: () => setAuthenticated(false) },
              ]);
            }}
          >
            <Text style={styles.lockBtnText}>🔒  Lock App</Text>
          </TouchableOpacity>

          <Text style={styles.version}>Note Night Dream  •  v1.0.0</Text>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
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
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1, borderColor: COLORS.bgCardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 18, color: COLORS.neonBlue },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, fontFamily: 'serif' },
  scroll: { padding: 16, paddingBottom: 40 },
  statusBar: {
    borderRadius: 12, padding: 14, marginBottom: 16,
    borderWidth: 1,
  },
  statusSuccess: {
    backgroundColor: 'rgba(0,255,204,0.1)',
    borderColor: 'rgba(0,255,204,0.4)',
  },
  statusError: {
    backgroundColor: 'rgba(255,60,110,0.1)',
    borderColor: 'rgba(255,60,110,0.4)',
  },
  statusText: { color: COLORS.textPrimary, fontSize: 13, lineHeight: 20 },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    padding: 18,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.neonBlue,
    letterSpacing: 2.5,
    marginBottom: 16,
  },
  sectionDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
    marginTop: -8,
  },
  bigStat: { alignItems: 'center', marginBottom: 20 },
  bigStatNumber: {
    fontSize: 48, fontWeight: '900', color: COLORS.neonBlue,
    textShadowColor: COLORS.neonBlue,
    textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16,
  },
  bigStatLabel: { fontSize: 12, color: COLORS.textMuted, letterSpacing: 0.5 },
  breakdownWrap: { gap: 10 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  breakdownCat: { width: 80, fontSize: 12, fontWeight: '600' },
  breakdownBarWrap: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2 },
  breakdownBar: { height: 4, borderRadius: 2 },
  breakdownCount: { width: 24, fontSize: 12, color: COLORS.textMuted, textAlign: 'right' },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.neonBlueGlow,
    borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.neonBlueDim,
  },
  actionBtnSecondary: {
    backgroundColor: 'rgba(0,255,204,0.08)',
    borderColor: 'rgba(0,255,204,0.3)',
  },
  actionBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionBtnIcon: { fontSize: 22 },
  actionBtnTitle: { fontSize: 15, fontWeight: '700', color: COLORS.neonBlue, marginBottom: 2 },
  actionBtnSub: { fontSize: 11, color: COLORS.textMuted },
  actionArrow: { fontSize: 18, color: COLORS.neonBlue, fontWeight: '300' },
  securityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,204,0,0.08)',
    borderRadius: 12, padding: 14, borderWidth: 1,
    borderColor: 'rgba(255,204,0,0.25)',
  },
  securityIcon: { fontSize: 22 },
  securityText: { flex: 1 },
  securityTitle: { fontSize: 15, fontWeight: '700', color: COLORS.neonGold, marginBottom: 2 },
  securitySub: { fontSize: 11, color: COLORS.textMuted },
  lockBtn: {
    backgroundColor: 'rgba(255,60,110,0.08)',
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,60,110,0.3)',
    paddingVertical: 16, alignItems: 'center', marginBottom: 24,
  },
  lockBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.neonRed, letterSpacing: 0.5 },
  version: { textAlign: 'center', fontSize: 11, color: COLORS.textMuted, letterSpacing: 1 },
});
