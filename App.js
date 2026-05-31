import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, Alert, Modal, Share 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState(null);
  const [isSettingUpPin, setIsSettingUpPin] = useState(false);
  
  const [dreams, setDreams] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedDream, setSelectedDream] = useState(null);

  // Form States
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [category, setCategory] = useState('Normal');

  useEffect(() => {
    loadPin();
    loadDreams();
  }, []);

  const loadPin = async () => {
    const p = await AsyncStorage.getItem('user_pin');
    if (p) {
      setSavedPin(p);
    } else {
      setIsSettingUpPin(true);
    }
  };

  const loadDreams = async () => {
    const d = await AsyncStorage.getItem('user_dreams');
    if (d) setDreams(JSON.parse(d));
  };

  const handlePinSubmit = async () => {
    if (isSettingUpPin) {
      if (pin.length === 4) {
        await AsyncStorage.setItem('user_pin', pin);
        setSavedPin(pin);
        setIsUnlocked(true);
        setIsSettingUpPin(false);
        setPin('');
      } else {
        Alert.alert('Error', 'PIN must be 4 digits');
      }
    } else {
      if (pin === savedPin) {
        setIsUnlocked(true);
        setPin('');
      } else {
        Alert.alert('Error', 'Wrong PIN');
        setPin('');
      }
    }
  };

  const saveDream = async () => {
    if (!title || !story) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    const newDream = {
      id: Date.now().toString(),
      title,
      story,
      category,
      date: new Date().toLocaleDateString()
    };
    const updatedDreams = [newDream, ...dreams];
    setDreams(updatedDreams);
    await AsyncStorage.setItem('user_dreams', JSON.stringify(updatedDreams));
    setModalVisible(false);
    setTitle('');
    setStory('');
  };

  const deleteDream = async (id) => {
    const updated = dreams.filter(d => d.id !== id);
    setDreams(updated);
    await AsyncStorage.setItem('user_dreams', JSON.stringify(updated));
    setViewModalVisible(false);
  };

  // BACKUP FEATURE
  const exportBackup = async () => {
    try {
      const backupData = JSON.stringify(dreams);
      const filename = `${FileSystem.documentDirectory}DreamJournal_Backup.json`;
      await FileSystem.writeAsStringAsync(filename, backupData, { encoding: FileSystem.EncodingType.UTF8 });
      
      await Share.share({
        url: filename,
        title: 'Save Dream Journal Backup'
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to generate backup file');
    }
  };

  // RESTORE FEATURE
  const importBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (!result.canceled && result.assets && result.assets[0]) {
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
        const importedDreams = JSON.parse(fileContent);
        if (Array.isArray(importedDreams)) {
          setDreams(importedDreams);
          await AsyncStorage.setItem('user_dreams', JSON.stringify(importedDreams));
          Alert.alert('Success', 'Dreams restored successfully!');
        } else {
          Alert.alert('Error', 'Invalid backup file format');
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to import backup');
    }
  };

  if (!isUnlocked) {
    return (
      <View style={styles.container}>
        <Text style={styles.neonTitle}>{isSettingUpPin ? 'Create Lock PIN' : 'Enter Private PIN'}</Text>
        <TextInput 
          style={styles.pinInput}
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
          value={pin}
          onChangeText={setPin}
          placeholder="----"
          placeholderTextColor="#00d2ff"
        />
        <TouchableOpacity style={styles.btn} onPress={handlePinSubmit}>
          <Text style={styles.btnText}>Proceed</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌙 Dream Journal</Text>
        <View style={styles.backupRow}>
          <TouchableOpacity onPress={exportBackup} style={styles.smallBtn}><Text style={styles.smallBtnText}>Backup</Text></TouchableOpacity>
          <TouchableOpacity onPress={importBackup} style={styles.smallBtn}><Text style={styles.smallBtnText}>Restore</Text></TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 15 }}>
        {dreams.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card}
            onPress={() => { setSelectedDream(item); setViewModalVisible(true); }}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.badge}>{item.category}</Text>
            </View>
            <Text style={styles.cardDate}>{item.date}</Text>
            <Text numberOfLines={2} style={styles.cardSnippet}>{item.story}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* ADD DREAM MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Record New Dream</Text>
            <TextInput style={styles.input} placeholder="Dream Title" placeholderTextColor="#666" value={title} onChangeText={setTitle} />
            <TextInput style={[styles.input, { height: 120 }]} multiline placeholder="What did you see?..." placeholderTextColor="#666" value={story} onChangeText={setStory} />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
              {['Normal', 'Lucid', 'Nightmare'].map(cat => (
                <TouchableOpacity key={cat} style={[styles.catSelect, category === cat && styles.catActive]} onPress={() => setCategory(cat)}>
                  <Text style={{ color: '#fff' }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.btn} onPress={saveDream}><Text style={styles.btnText}>Save Entry</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#333', marginTop: 10 }]} onPress={() => setModalVisible(false)}><Text style={styles.btnText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* VIEW DREAM MODAL */}
      <Modal visible={viewModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedDream && (
              <>
                <Text style={styles.modalHeading}>{selectedDream.title}</Text>
                <Text style={{ color: '#00d2ff', marginBottom: 10 }}>{selectedDream.date} | {selectedDream.category}</Text>
                <ScrollView style={{ maxHeight: 200 }}><Text style={{ color: '#fff', fontSize: 16 }}>{selectedDream.story}</Text></ScrollView>
                <TouchableOpacity style={[styles.btn, { backgroundColor: 'red', marginTop: 20 }]} onPress={() => deleteDream(selectedDream.id)}><Text style={styles.btnText}>Delete</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#333', marginTop: 10 }]} onPress={() => setViewModalVisible(false)}><Text style={styles.btnText}>Close</Text></TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1a', justifyContent: 'center', alignItems: 'center' },
  mainContainer: { flex: 1, backgroundColor: '#0a0f1a', paddingTop: 50 },
  neonTitle: { color: '#00d2ff', fontSize: 24, fontWeight: 'bold', textShadowColor: '#00d2ff', textShadowRadius: 10, marginBottom: 20 },
  pinInput: { backgroundColor: '#111a2e', color: '#fff', fontSize: 32, textAlign: 'center', width: 150, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#00d2ff', marginBottom: 20 },
  btn: { backgroundColor: '#00d2ff', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8, width: '100%', alignItems: 'center' },
  btnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 15, borderBottomWidth: 1, borderColor: '#111a2e' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  backupRow: { flexDirection: 'row' },
  smallBtn: { backgroundColor: '#111a2e', padding: 8, borderRadius: 5, marginLeft: 5, borderWidth: 1, borderColor: '#00d2ff' },
  smallBtnText: { color: '#00d2ff', fontSize: 12 },
  card: { backgroundColor: '#111a2e', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#1a263f' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  badge: { color: '#00d2ff', fontSize: 12, borderHeight: 1, backgroundColor: '#1a263f', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  cardDate: { color: '#666', fontSize: 12, marginVertical: 4 },
  cardSnippet: { color: '#aaa', fontSize: 14 },
  fab: { position: 'absolute', right: 20, bottom: 30, backgroundColor: '#00d2ff', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#000', fontSize: 32, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#111a2e', borderRadius: 15, padding: 20, borderWidth: 1, borderColor: '#00d2ff' },
  modalHeading: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  input: { backgroundColor: '#0a0f1a', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#1a263f' },
  catSelect: { padding: 10, borderRadius: 5, borderWidth: 1, borderColor: '#1a263f' },
  catActive: { borderColor: '#00d2ff', backgroundColor: '#1a263f' }
});
    
