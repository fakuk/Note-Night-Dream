import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const SettingsScreen = ({ navigation }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [dreamCount, setDreamCount] = useState(0);

  React.useEffect(() => {
    loadDreamCount();
    const unsubscribe = navigation.addListener('focus', loadDreamCount);
    return unsubscribe;
  }, [navigation]);

  const loadDreamCount = async () => {
    try {
      const dreamsData = await AsyncStorage.getItem('dreams');
      if (dreamsData) {
        const dreams = JSON.parse(dreamsData);
        setDreamCount(dreams.length);
      } else {
        setDreamCount(0);
      }
    } catch (error) {
      console.error('Error loading dream count:', error);
    }
  };

  const handleExportBackup = async () => {
    try {
      setIsExporting(true);

      // Get all dreams from AsyncStorage
      const dreamsData = await AsyncStorage.getItem('dreams');
      const dreams = dreamsData ? JSON.parse(dreamsData) : [];

      if (dreams.length === 0) {
        Alert.alert('Info', 'No dreams to export');
        return;
      }

      // Create backup object
      const backup = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        dreamCount: dreams.length,
        dreams: dreams,
      };

      // Create filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `note-night-dream-backup-${timestamp}.json`;
      const filePath = `${FileSystem.documentDirectory}${filename}`;

      // Write backup file
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(backup, null, 2));

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      } else {
        Alert.alert(
          'Success',
          `Backup created: ${filename}\n\nFile saved to your device documents folder.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export backup');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = async () => {
    try {
      setIsImporting(true);

      // Pick JSON file
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
      });

      if (result.canceled) {
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const backup = JSON.parse(fileContent);

      // Validate backup structure
      if (!backup.dreams || !Array.isArray(backup.dreams)) {
        Alert.alert('Error', 'Invalid backup file format');
        return;
      }

      // Ask for confirmation
      Alert.alert(
        'Import Backup',
        `This will ${dreamCount > 0 ? 'merge' : 'import'} ${backup.dreamCount} dream(s).\n\nExisting dreams will be preserved.`,
        [
          { text: 'Cancel', onPress: () => {}, style: 'cancel' },
          {
            text: 'Import',
            onPress: async () => {
              try {
                // Get existing dreams
                const existingDreamsData = await AsyncStorage.getItem('dreams');
                let allDreams = existingDreamsData ? JSON.parse(existingDreamsData) : [];

                // Merge dreams (avoid duplicates by ID)
                const existingIds = new Set(allDreams.map((d) => d.id));
                const newDreams = backup.dreams.filter((d) => !existingIds.has(d.id));

                allDreams = [...allDreams, ...newDreams];

                // Save merged dreams
                await AsyncStorage.setItem('dreams', JSON.stringify(allDreams));
                loadDreamCount();

                Alert.alert(
                  'Success',
                  `${newDreams.length} dream(s) imported successfully!`
                );
              } catch (error) {
                Alert.alert('Error', 'Failed to import dreams');
                console.error('Import merge error:', error);
              }
            },
            style: 'default',
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to read backup file');
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearAllDreams = () => {
    Alert.alert(
      'Clear All Dreams',
      'This will permanently delete ALL your dreams. This action cannot be undone.',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete All',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('dreams');
              setDreamCount(0);
              Alert.alert('Success', 'All dreams have been deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear dreams');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const SettingCard = ({ icon, title, description, onPress, isLoading, isDanger }) => (
    <TouchableOpacity
      style={styles.settingCard}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#0f1621', '#151d2a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.settingCardGradient}
      >
        <View style={styles.settingCardLeft}>
          <View
            style={[
              styles.settingIcon,
              isDanger && styles.settingIconDanger,
            ]}
          >
            <MaterialCommunityIcons
              name={icon}
              size={24}
              color={isDanger ? '#ff6b9d' : '#00d4ff'}
            />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>{title}</Text>
            <Text style={styles.settingDescription}>{description}</Text>
          </View>
        </View>
        {isLoading ? (
          <ActivityIndicator size="small" color="#00d4ff" />
        ) : (
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={isDanger ? '#ff6b9d' : '#00d4ff'}
          />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your dreams & data</Text>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <LinearGradient
            colors={['#00d4ff20', '#0099cc15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsCardGradient}
          >
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="moon-waning-crescent" size={32} color="#00d4ff" />
              <View>
                <Text style={styles.statLabel}>Total Dreams</Text>
                <Text style={styles.statValue}>{dreamCount}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Backup & Restore Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup & Restore</Text>
          <View style={styles.sectionContent}>
            <SettingCard
              icon="cloud-upload-outline"
              title="Export Backup"
              description="Save your dreams as a JSON file"
              onPress={handleExportBackup}
              isLoading={isExporting}
            />
            <SettingCard
              icon="cloud-download-outline"
              title="Import Backup"
              description="Restore dreams from a backup file"
              onPress={handleImportBackup}
              isLoading={isImporting}
            />
          </View>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.sectionContent}>
            <SettingCard
              icon="alert-circle-outline"
              title="Clear All Dreams"
              description="Permanently delete all your dreams"
              onPress={handleClearAllDreams}
              isDanger
            />
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionContent}>
            <View style={styles.infoCard}>
              <LinearGradient
                colors={['#0f1621', '#151d2a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.settingCardGradient}
              >
                <View>
                  <Text style={styles.infoLabel}>App Name</Text>
                  <Text style={styles.infoValue}>Note Night Dream</Text>
                </View>
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.infoLabel}>Version</Text>
                  <Text style={styles.infoValue}>1.0.0</Text>
                </View>
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.infoLabel}>Type</Text>
                  <Text style={styles.infoValue}>Offline-First, Secure</Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#ffd700" />
              <Text style={styles.tipText}>
                Regularly export backups to keep your dreams safe.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#ffd700" />
              <Text style={styles.tipText}>
                Your dreams are stored locally on your device only.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#ffd700" />
              <Text style={styles.tipText}>
                Add dreams to your favorite category to organize them.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ for dreamers</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 24,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8899bb',
  },
  statsCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#00d4ff30',
  },
  statsCardGradient: {
    padding: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#8899bb',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#00d4ff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00d4ff',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionContent: {
    gap: 12,
  },
  settingCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#00d4ff20',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingCardGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#00d4ff15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingIconDanger: {
    backgroundColor: '#ff6b9d15',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#8899bb',
  },
  infoCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#00d4ff20',
  },
  infoLabel: {
    fontSize: 12,
    color: '#8899bb',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00d4ff',
  },
  tipsContainer: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: '#0f1621',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffd70020',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#ffffff',
    lineHeight: 18,
  },
  footer: {
    marginTop: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#00d4ff15',
  },
  footerText: {
    fontSize: 12,
    color: '#8899bb',
    textAlign: 'center',
  },
});

export default SettingsScreen;
