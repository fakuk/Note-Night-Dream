import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const PINAuthScreen = ({ route, navigation }) => {
  const { isSetup = false, onAuthenticated } = route.params;
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [stage, setStage] = useState(isSetup ? 'setupPin' : 'verifyPin');
  const [shakeAnim] = useState(new Animated.Value(0));

  const handlePinPress = (digit) => {
    if (stage === 'setupPin' && pin.length < 4) {
      setPin(pin + digit);
    } else if (stage === 'confirmPin' && confirmPin.length < 4) {
      setConfirmPin(confirmPin + digit);
    } else if (stage === 'verifyPin' && pin.length < 4) {
      setPin(pin + digit);
    }
  };

  const handleDelete = () => {
    if (stage === 'setupPin') {
      setPin(pin.slice(0, -1));
    } else if (stage === 'confirmPin') {
      setConfirmPin(confirmPin.slice(0, -1));
    } else if (stage === 'verifyPin') {
      setPin(pin.slice(0, -1));
    }
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: false }),
    ]).start();
  };

  const handleSetupPin = async () => {
    if (pin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }
    setStage('confirmPin');
    setPin('');
  };

  const handleConfirmPin = async () => {
    if (confirmPin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      shake();
      Alert.alert('Error', 'PINs do not match');
      setPin('');
      setConfirmPin('');
      setStage('setupPin');
      return;
    }
    try {
      await AsyncStorage.setItem('appPin', confirmPin);
      onAuthenticated();
    } catch (error) {
      Alert.alert('Error', 'Failed to save PIN');
    }
  };

  const handleVerifyPin = async () => {
    if (pin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }
    try {
      const storedPin = await AsyncStorage.getItem('appPin');
      if (storedPin === pin) {
        onAuthenticated();
      } else {
        shake();
        Alert.alert('Error', 'Incorrect PIN');
        setPin('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify PIN');
    }
  };

  const getTitle = () => {
    if (stage === 'setupPin') return 'Create Your PIN';
    if (stage === 'confirmPin') return 'Confirm Your PIN';
    return 'Enter Your PIN';
  };

  const getDescription = () => {
    if (stage === 'setupPin')
      return 'Set up a 4-digit PIN to secure your dreams';
    if (stage === 'confirmPin') return 'Confirm your PIN to proceed';
    return 'Enter your PIN to unlock your dreams';
  };

  const currentPin =
    stage === 'confirmPin' ? confirmPin : stage === 'setupPin' ? pin : pin;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0f1a', '#0f1621', '#0a0f1a']}
        style={styles.gradient}
      >
        {/* Stars Background */}
        <View style={styles.starsContainer}>
          {[...Array(15)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.star,
                {
                  top: Math.random() * height * 0.3,
                  left: Math.random() * width,
                  opacity: Math.random() * 0.5 + 0.3,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.content}>
          {/* Moon Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="moon-waning-crescent"
              size={80}
              color="#00d4ff"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.description}>{getDescription()}</Text>

          {/* PIN Display */}
          <Animated.View style={[styles.pinDisplay, { transform: [{ translateX: shakeAnim }] }]}>
            {[...Array(4)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.pinDot,
                  i < currentPin.length && styles.pinDotFilled,
                ]}
              >
                {i < currentPin.length && (
                  <View style={styles.innerDot} />
                )}
              </View>
            ))}
          </Animated.View>

          {/* Numpad */}
          <View style={styles.numpadContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <TouchableOpacity
                key={num}
                style={styles.numpadButton}
                onPress={() => handlePinPress(num)}
                activeOpacity={0.6}
              >
                <Text style={styles.numpadButtonText}>{num}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.numpadButton}
              onPress={() => handlePinPress(0)}
              activeOpacity={0.6}
            >
              <Text style={styles.numpadButtonText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.6}
            >
              <MaterialCommunityIcons
                name="backspace-outline"
                size={28}
                color="#00d4ff"
              />
            </TouchableOpacity>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (stage === 'setupPin') handleSetupPin();
              else if (stage === 'confirmPin') handleConfirmPin();
              else handleVerifyPin();
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#00d4ff', '#0099cc']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>
                {stage === 'setupPin' ? 'Next' : stage === 'confirmPin' ? 'Create PIN' : 'Unlock'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1a',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    justifyContent: 'center',
  },
  starsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#00d4ff',
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 40,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#00d4ff40',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00d4ff10',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#8899bb',
    marginBottom: 40,
    textAlign: 'center',
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 60,
    gap: 15,
  },
  pinDot: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#00d4ff40',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00d4ff10',
  },
  pinDotFilled: {
    borderColor: '#00d4ff',
    backgroundColor: '#00d4ff20',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
  },
  innerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00d4ff',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 3,
  },
  numpadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
    width: '100%',
  },
  numpadButton: {
    width: '28%',
    aspectRatio: 1,
    borderRadius: 15,
    backgroundColor: '#0f1621',
    borderWidth: 1,
    borderColor: '#00d4ff30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  numpadButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#00d4ff',
  },
  deleteButton: {
    width: '28%',
    aspectRatio: 1,
    borderRadius: 15,
    backgroundColor: '#0f1621',
    borderWidth: 1,
    borderColor: '#00d4ff30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  actionButton: {
    width: '100%',
    height: 55,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  actionButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default PINAuthScreen;
