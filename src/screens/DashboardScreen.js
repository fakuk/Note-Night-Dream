import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [dreams, setDreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fabScale] = useState(new Animated.Value(1));

  useFocusEffect(
    useCallback(() => {
      loadDreams();
    }, [])
  );

  const loadDreams = async () => {
    try {
      setIsLoading(true);
      const dreamsData = await AsyncStorage.getItem('dreams');
      if (dreamsData) {
        const parsedDreams = JSON.parse(dreamsData);
        setDreams(parsedDreams.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    } catch (error) {
      console.error('Error loading dreams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFabPress = () => {
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(fabScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    navigation.navigate('DreamEntry', { isEditing: false });
  };

  const handleDreamPress = (dream) => {
    navigation.navigate('DreamDetail', { dream });
  };

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const DreamCard = ({ dream }) => (
    <TouchableOpacity
      style={styles.dreamCard}
      onPress={() => handleDreamPress(dream)}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={['#0f1621', '#151d2a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.dreamCardGradient}
      >
        {/* Left Border Accent */}
        <View
          style={[
            styles.dreamCardBorder,
            { borderLeftColor: getCategoryColor(dream.category) },
          ]}
        />

        {/* Category Badge */}
        <View style={styles.dreamCardHeader}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(dream.category) + '20' },
            ]}
          >
            <MaterialCommunityIcons
              name={getCategoryIcon(dream.category)}
              size={14}
              color={getCategoryColor(dream.category)}
            />
            <Text
              style={[
                styles.categoryBadgeText,
                { color: getCategoryColor(dream.category) },
              ]}
            >
              {dream.category.charAt(0).toUpperCase() + dream.category.slice(1)}
            </Text>
          </View>
          <Text style={styles.dreamDate}>{formatDate(dream.date)}</Text>
        </View>

        {/* Title */}
        <Text style={styles.dreamTitle} numberOfLines={2}>
          {dream.title}
        </Text>

        {/* Snippet */}
        <Text style={styles.dreamSnippet} numberOfLines={3}>
          {dream.story}
        </Text>

        {/* Footer */}
        <View style={styles.dreamCardFooter}>
          <MaterialCommunityIcons
            name="arrow-right"
            size={18}
            color="#00d4ff"
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Welcome back</Text>
          <Text style={styles.headerTitle}>Your Dream Journal</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="moon-waning-crescent"
            size={32}
            color="#00d4ff"
          />
        </View>
      </View>

      {/* Dreams List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00d4ff" />
        </View>
      ) : dreams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="moon-new"
            size={80}
            color="#00d4ff40"
          />
          <Text style={styles.emptyTitle}>No dreams yet</Text>
          <Text style={styles.emptyDescription}>
            Start recording your dreams by tapping the button below
          </Text>
        </View>
      ) : (
        <FlatList
          data={dreams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DreamCard dream={item} />}
          scrollEventThrottle={16}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <Animated.View
        style={[
          styles.fabContainer,
          { transform: [{ scale: fabScale }] },
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={handleFabPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#00d4ff', '#0099cc']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <MaterialCommunityIcons
              name="plus"
              size={36}
              color="#ffffff"
            />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#00d4ff15',
  },
  headerGreeting: {
    fontSize: 14,
    color: '#8899bb',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00d4ff15',
    borderWidth: 1,
    borderColor: '#00d4ff30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  dreamCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  dreamCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#00d4ff20',
  },
  dreamCardBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderLeftWidth: 4,
  },
  dreamCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dreamDate: {
    fontSize: 12,
    color: '#8899bb',
  },
  dreamTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    marginLeft: 8,
  },
  dreamSnippet: {
    fontSize: 13,
    color: '#99aabb',
    lineHeight: 18,
    marginBottom: 12,
    marginLeft: 8,
  },
  dreamCardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#8899bb',
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  fab: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    overflow: 'hidden',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 12,
  },
  fabGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DashboardScreen;
