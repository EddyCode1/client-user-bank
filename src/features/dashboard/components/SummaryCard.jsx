import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const colors = {
  surface: '#1E1E1E',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',
  danger: '#EF4444',
};

export default function SummaryCard({
  title,
  value,
  icon,
  loading,
  error,
  empty,
  accent = colors.primary,
  onClick,
  tooltip,
  index = 0,
}) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconBgColor = accent.startsWith('#') && accent.length === 7 ? `${accent}22` : 'rgba(0, 173, 181, 0.13)';

  return (
    <AnimatedPressable
      entering={FadeInUp.duration(450).delay(index * 90).springify().damping(16)}
      style={[styles.card, { borderColor: accent }, pressStyle, loading && styles.loadingOpacity]}
      onPress={onClick}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 14, stiffness: 260 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 200 });
      }}
      disabled={loading || !onClick}
      accessibilityRole="button"
      accessibilityLabel={tooltip || title}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          {typeof icon === 'string' ? (
            <Text style={{ fontSize: 18 }}>{icon}</Text>
          ) : (
            icon
          )}
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.valueContainer}>
        {loading ? (
          <ActivityIndicator size="small" color={accent} style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText} numberOfLines={1}>
            {error}
          </Text>
        ) : empty ? (
          <Text style={styles.mutedText} numberOfLines={1}>
            Sin datos
          </Text>
        ) : (
          <Text style={[styles.value, { color: accent }]} numberOfLines={1}>
            {value}
          </Text>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 18,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 14,
  },
  loadingOpacity: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  },
  valueContainer: {
    marginTop: 12,
    justifyContent: 'center',
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
    fontWeight: '500',
  },
  mutedText: {
    fontSize: 14,
    color: colors.muted,
  },
  loader: {
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
});
