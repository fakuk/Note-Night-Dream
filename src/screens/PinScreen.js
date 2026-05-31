// src/screens/PinScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Vibration, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { savePin } from '../utils/storage';
import { COLORS } from '../utils/theme';

const { width } = Dimensions.get('window');

const KEYS = [
  ['1','2','3'],
  ['4','5','6'],
  ['7','8','9'],
  ['✕','0','⌫'],
];

export default function PinScreen() {
  const { pin, setPin, setAuthenticated } = useApp();
  const [input, setInput]       = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError]       = useState('');
  const [shake]                 = useState(new Animated.Value(0));
  const [glowAnim]              = useState(new Animated.Value(0));
  const isSettingPin = !pin;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const triggerShake = () => {
    Vibration.vibrate(300);
    Animated.sequence([
      Animated.timing(shake, { toValue: 12,  duration: 60,  useNativeDriver: true }),
      Animated.timing(shake, { toValue: -12, duration: 60,  useNativeDriver: true }),
      Animated.timing(shake, { toValue: 8,   duration: 60,  useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8,  duration: 60,  useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0,   duration: 60,  useNativeDriver: true }),
    ]).start();
  };

  const handleKey = (key) => {
    setError('');
    if (key === '✕') {
      setInput('');
      setConfirmPin('');
      setIsConfirming(false);
      return;
    }
    if (key === '⌫') {
      setInput(prev => prev.slice(0, -1));
      return;
    }
    if (input.length >= 4) return;

    const next = input + key;
    setInput(next);

    if (next.length === 4) {
      setTimeout(() => handleComplete(next), 150);
    }
  };

  const handleComplete = async (code) => {
    if (isSettingPin) {
      if (!isConfirming) {
        setConfirmPin(code);
        setIsConfirming(true);
        setInput('');
      } else {
        if (code === confirmPin) {
          await savePin(code);
          setPin(code);
          setAuthenticated(true);
        } else {
          triggerShake();
          setError("PINs don't match. Try again.");
          setInput('');
          setConfirmPin('');
          setIsConfirming(false);
        }
      }
    } else {
      if (code === pin) {
        setAuthenticated(true);
      } else {
        triggerShake();
        setError('Incorrect PIN');
        setInput('');
      }
    }
  };

  const dots = Array.from({ length: 4 }, (_, i) => i < input.length);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1], outputRange: [0.4, 1],
  });

  const subtitle = isSettingPin
    ? isConfirming ? 'Confirm your PIN' : 'Create a 4-digit PIN'
    : 'Enter your PIN';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Background radial glow */}
      <Animated.View style={[styles.bgGlow, { opacity: glowOpacity }]} />

      <View style={styles.header}>
        {/* Moon icon */}
        <Animated.Text style={[styles.moonIcon, { opacity: glowOpacity }]}>☽</Animated.Text>
        <Text style={styles.appTitle}>Note Night Dream</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* PIN dots */}
      <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shake }] }]}>
        {dots.map((filled, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              filled && styles.dotFilled,
              filled && { shadowColor: COLORS.neonBlue, shadowOpacity: 1, shadowRadius: 10, elevation: 6 },
            ]}
          />
        ))}
      </Animated.View>

      {error ? <Text style={styles.errorText}>{error}</Text> : <View style={{ height: 24 }} />}

      {/* Numpad */}
      <View style={styles.numpad}>
        {KEYS.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.key,
                  key === '✕' && styles.keyCancel,
                  key === '⌫' && styles.keyBack,
                ]}
                onPress={() => handleKey(key)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.keyText,
                  (key === '✕' || key === '⌫') && styles.keyTextSpecial,
                ]}>
                  {key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgGlow: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'transparent',
    top: '10%',
    alignSelf: 'center',
    shadowColor: COLORS.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 80,
    elevation: 0,
    borderWidth: 1,
    borderColor: 'rgba(0,180,255,0.05)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  moonIcon: {
    fontSize: 52,
    color: COLORS.neonBlue,
    marginBottom: 12,
    textShadowColor: COLORS.neonBlue,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 1.5,
    fontFamily: 'serif',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.neonBlueDim,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: COLORS.neonBlue,
    borderColor: COLORS.neonBlue,
  },
  errorText: {
    color: COLORS.neonRed,
    fontSize: 13,
    letterSpacing: 0.3,
    height: 24,
  },
  numpad: {
    marginTop: 28,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
  },
  key: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.neonBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  keyCancel: {
    backgroundColor: 'rgba(255,60,110,0.08)',
    borderColor: 'rgba(255,60,110,0.25)',
  },
  keyBack: {
    backgroundColor: 'rgba(0,180,255,0.06)',
    borderColor: 'rgba(0,180,255,0.2)',
  },
  keyText: {
    fontSize: 26,
    fontWeight: '300',
    color: COLORS.textPrimary,
  },
  keyTextSpecial: {
    fontSize: 22,
    color: COLORS.textSecondary,
  },
});
