import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const DreamDetailScreen = ({ navigation, route }) => {
  const { dream } = route.params;
  const [dreams, setDreams] = useState([]);

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
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleEdit = () => {
    navigation.navigate('DreamEntry', { dream });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Dream',
      'Are you sure you want to delete this dream? This action cannot be undone.',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const dreamsData = await AsyncStorage.getItem('dreams');
              if (dreamsData) {
                let allDreams = JSON.parse(dreamsData);
                allDreams = allDreams.filter((d) => d.id !== dream.id);
                await AsyncStorage.setItem('dreams', JSON.stringify(allDreams));
              }
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete dream');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${dream.title}\n\n${dream.story}\n\n— Dream recorded on ${formatDate(dream.date)}`,
        title: dream.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share dream');
    }
  };

  return (
    <View style={styles.container}>
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
          <Text style={styles.headerTitle}>Dream Details</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Dream Card */}
        <LinearGradient
          colors={['#0f1621', '#151d2a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.dreamCard}
        >
          {/* Category Badge */}
          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: getCategoryColor(dream.category) + '20' },
              ]}
            >
              <MaterialCommunityIcons
                name={getCategoryIcon(dream.category)}
                size={16}
                color={getCategoryColor(dream.category)}
              />
              <Text
                style={[
                  styles.categoryText,
                  { color: getCategoryColor(dream.category) },
                ]}
              >
                {dream.category.charAt(0).toUpperCase() + dream.category.slice(1)}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.dreamTitle}>{dream.title}</Text>

          {/* Date & Time Info */}
          <View style={styles.metaContainer}>
            <MaterialCommunityIcons name="calendar-clock" size={16} color="#8899bb" />
            <Text style={styles.metaText}>{formatDate(dream.date)}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Story */}
          <Text style={styles.storyLabel}>Your Story</Text>
          <Text style={styles.storyText}>{dream.story}</Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="format-paragraph" size={20} color="#00d4ff" />
              <View>
                <Text style={styles.statLabel}>Word Count</Text>
                <Text style={styles.statValue}>{dream.story.split(/\s+/).length}</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="text-box" size={20} color="#00d4ff" />
              <View>
                <Text style={styles.statLabel}>Characters</Text>
                <Text style={styles.statValue}>{dream.story.length}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Additional Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>{formatDate(dream.createdAt)}</Text>
          </View>
          {dream.updatedAt !== dream.createdAt && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>{formatDate(dream.updatedAt)}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="share-variant" size={24} color="#00d4ff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleEdit}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="pencil" size={24} color="#00d4ff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={24} color="#ff6b9d" />
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  dreamCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#00d4ff20',
    marginBottom: 24,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  badgeContainer: {
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dreamTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  metaText: {
    fontSize: 13,
    color: '#8899bb',
  },
  divider: {
    height: 1,
    backgroundColor: '#00d4ff15',
    marginVertical: 16,
  },
  storyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00d4ff',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  storyText: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 24,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#00d4ff15',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#8899bb',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00d4ff',
  },
  infoSection: {
    backgroundColor: '#0f1621',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00d4ff20',
    padding: 16,
    marginBottom: 20,
  },
  infoItem: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8899bb',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    color: '#ffffff',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#0f1621',
    borderTopWidth: 1,
    borderTopColor: '#00d4ff15',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#151d2a',
    borderWidth: 1,
    borderColor: '#00d4ff30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    borderColor: '#ff6b9d30',
  },
});

export default DreamDetailScreen;
