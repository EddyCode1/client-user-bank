import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useQuickLinkFavorites } from '../hooks/useQuickLinkFavorites';
import { navigateToMainTab } from '../../../shared/navigation/tabNavigation';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 12) / 2; // (Pantalla - Padding total - Gap medio) / 2 columnas

const colors = {
  surface: '#1E1E1E',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',
  primaryMuted: 'rgba(0, 173, 181, 0.1)',
  favorite: '#FBBF24',
  skeleton: '#262626',
};

function QuickLinkCard({ item, index, favoriteActive, onToggleFavorite, onPress }) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      entering={FadeInUp.duration(400).delay(index * 60).springify().damping(16)}
      style={[styles.card, pressStyle]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 14, stiffness: 260 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 200 });
      }}
    >
      <View style={styles.linkContent}>
        <View style={styles.iconContainer}>
          {typeof item.icon === 'string' ? (
            <Text style={styles.iconText}>{item.icon}</Text>
          ) : (
            item.icon
          )}
        </View>
        <Text style={styles.label} numberOfLines={2}>
          {item.label}
        </Text>
      </View>

      <Pressable
        style={styles.favoriteButton}
        hitSlop={8}
        onPress={onToggleFavorite}
      >
        <MaterialCommunityIcons
          name={favoriteActive ? "star" : "star-outline"}
          size={20}
          color={favoriteActive ? colors.favorite : colors.muted}
        />
      </Pressable>
    </AnimatedPressable>
  );
}

export default function QuickLinks({ links = [], loading }) {
  const navigation = useNavigation();
  const { isFavorite, toggleFavorite } = useQuickLinkFavorites();

  if (loading) {
    return (
      <View style={styles.gridContainer}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={[styles.card, styles.skeletonCard]} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.gridContainer}>
      {links.map((item, index) => (
        <QuickLinkCard
          key={item.id}
          item={item}
          index={index}
          favoriteActive={isFavorite(item.id)}
          onToggleFavorite={() => toggleFavorite(item.id)}
          onPress={() => {
            if (typeof item.path === 'string') {
              navigateToMainTab(navigation, item.path);
            } else {
              navigateToMainTab(navigation, item.path.tab, { screen: item.path.screen });
            }
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    width: '100%',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    position: 'relative',
    minHeight: 82,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  skeletonCard: {
    backgroundColor: colors.skeleton,
    borderColor: 'transparent',
    opacity: 0.5,
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  label: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 18,
  },
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 4,
  },
});
