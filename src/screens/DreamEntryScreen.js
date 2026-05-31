import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

const CATEGORIES = ['nightmare', 'lucid', 'prophetic', 'recurring', 'adventure', 'mystery'];

const DreamEntryScreen = ({ navigation, route }) => {
  const { dream: editingDream } = route.params || {};
  const isEditing = !!editingDream;

  const [title, setTitle] = useState(editingDream?.title || '');
  const [story, setStory] = useState(editingDream?.story || '');
  const [selectedCategory, setSelectedCategory] = useState(editingDream?.category || 'lucid');
  const [selectedDate, setSelectedDate] = useState(new Date(editingDream?.date || new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getCategoryColor = (category) => {
    const colors = {
      nightmare: '#ff6b9d',
      lucid: '#00d4ff',
      prophetic: '#ffd700',
      recurring: '#ff8c00',
      adventure: '#00ff88',
      mystery: '#b19cd9',
    };
    return colors[category] || '#00d4ff';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      nightmare: 'skull-outline',
      lucid: 'eye-outline',
      prophetic: 'crystal-ball',
      recurring: 'repeat',
      adventure: 'compass',
      mystery: 'help-circle-outline',
    };
    return icons[category] || 'moon-new';
  };

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a dream title');
      return;
    }
    if (!story.trim()) {
      Alert.alert('Error', 'Please enter your dream story');
      return;
    }

    setIsSaving(true);
    try {
      let dreams = [];
      const existingDreams = await AsyncStorage.getItem('dreams');
      if (existingDreams) {
        dreams = JSON.parse(existingDreams);
      }

      const dreamEntry = {
        id: editingDream?.id || Date.now().toString(),
        title: title.trim(),
        story: story.trim(),
        category: selectedCategory,
        date: selectedDate.toISOString(),
        createdAt: editingDream?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isEditing) {
        const index = dreams.findIndex((d) => d.id === editingDream.id);
        if (index > -1) {
          dreams[index] = dreamEntry;
        }
      } else {
        dreams.push(dreamEntry);
      }

      await AsyncStorage.setItem('dreams', JSON.stringify(dreams));
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save dream');
      console.error('Error saving dream:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#00d4ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Dream' : 'Record Your Dream'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Dream Title</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="moon-waning-crescent"
              size={20}
              color="#00d4ff"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Give your dream a name..."
              placeholderTextColor="#4a5d7d"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>
        </View>

        {/* Date Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="calendar"
              size={20}
              color="#00d4ff"
              style={styles.inputIcon}
            />
            <Text style={styles.dateButtonText}>{formatDate(selectedDate)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              textColor="#00d4ff"
            />
          )}
        </View>

        {/* Category Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryOption,
                  selectedCategory === category && styles.categoryOptionSelected,
                  {
                    borderColor:
                      selectedCategory === category
                        ? getCategoryColor(category)
                        : '#00d4ff30',
                  },
                ]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={getCategoryIcon(category)}
                  size={20}
                  color={getCategoryColor(category)}
                />
                <Text
                  style={[
                    styles.categoryOptionText,
                    {
                      color: getCategoryColor(category),
                    },
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Story Input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your Story</Text>
          <View style={styles.storyInputContainer}>
            <TextInput
              style={styles.storyTextInput}
              placeholder="Write your dream in detail..."
              placeholderTextColor="#4a5d7d"
              value={story}
              onChangeText={setStory}
              multiline
              maxLength={5000}
              textAlignVertical="top"
            />
            <Text style={styles.storyCharCount}>{story.length}/5000</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#00d4ff', '#0099cc']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveButtonGradient}
            >
              <MaterialCommunityIcons
                name={isEditing ? 'check' : 'plus'}
                size={20}
                color="#ffffff"
              />
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Save Dream'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00d4ff',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f1621',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00d4ff20',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    paddingVertical: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#8899bb',
    marginLeft: 10,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f1621',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00d4ff20',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryOption: {
    flex: 1,
    minWidth: '48%',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    backgroundColor: '#0f1621',
  },
  categoryOptionSelected: {
    backgroundColor: '#00d4ff10',
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  storyInputContainer: {
    backgroundColor: '#0f1621',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00d4ff20',
    padding: 12,
    minHeight: 200,
  },
  storyTextInput: {
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
  },
  storyCharCount: {
    fontSize: 12,
    color: '#8899bb',
    marginTop: 8,
    textAlign: 'right',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00d4ff30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00d4ff',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default DreamEntryScreen;
