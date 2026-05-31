// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const DREAMS_KEY = '@NightDream:dreams';
const PIN_KEY    = '@NightDream:pin';

// ─── Dreams ───────────────────────────────────────────────────────────────────

export async function getDreams() {
  try {
    const json = await AsyncStorage.getItem(DREAMS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('getDreams error:', e);
    return [];
  }
}

export async function saveDream(dream) {
  try {
    const dreams = await getDreams();
    const idx = dreams.findIndex(d => d.id === dream.id);
    if (idx >= 0) {
      dreams[idx] = dream;
    } else {
      dreams.unshift(dream);          // newest first
    }
    await AsyncStorage.setItem(DREAMS_KEY, JSON.stringify(dreams));
    return true;
  } catch (e) {
    console.error('saveDream error:', e);
    return false;
  }
}

export async function deleteDream(id) {
  try {
    const dreams = await getDreams();
    const filtered = dreams.filter(d => d.id !== id);
    await AsyncStorage.setItem(DREAMS_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('deleteDream error:', e);
    return false;
  }
}

export function createDream(overrides = {}) {
  return {
    id: Date.now().toString(),
    title: '',
    story: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Other',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ─── PIN ──────────────────────────────────────────────────────────────────────

export async function getPin() {
  try {
    return await AsyncStorage.getItem(PIN_KEY);
  } catch {
    return null;
  }
}

export async function savePin(pin) {
  try {
    await AsyncStorage.setItem(PIN_KEY, pin);
    return true;
  } catch {
    return false;
  }
}

// ─── Backup / Restore ─────────────────────────────────────────────────────────

export async function exportData() {
  const dreams = await getDreams();
  const pin    = await getPin();
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), pin, dreams }, null, 2);
}

export async function importData(json) {
  const data = JSON.parse(json);
  if (!data.dreams || !Array.isArray(data.dreams)) {
    throw new Error('Invalid backup file: missing dreams array');
  }
  await AsyncStorage.setItem(DREAMS_KEY, JSON.stringify(data.dreams));
  if (data.pin) await AsyncStorage.setItem(PIN_KEY, data.pin);
  return data.dreams.length;
}
