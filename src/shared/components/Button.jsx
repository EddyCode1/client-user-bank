import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";
import { COLORS, SPACING, FONT_SIZE, RADIUS, GRADIENTS } from "../constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Button = ({
    title,
    onPress,
    loading,
    disabled,
    variant = "primary",
    style,
    ...props
}) => {
    const isSecondary = variant === "secondary";
    const isGhost = variant === "ghost";
    const isDisabled = disabled || loading;

    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 14, stiffness: 260 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    };

    const handlePress = (e) => {
        if (isDisabled) return;
        onPress?.(e);
    };

    const content = loading ? (
        <ActivityIndicator
            color={isSecondary || isGhost ? COLORS.primary : COLORS.surface}
        />
    ) : (
        <Text
            style={[
                styles.text,
                isSecondary || isGhost ? styles.textSecondary : styles.textPrimary,
            ]}
        >
            {title}
        </Text>
    );

    return (
        <AnimatedPressable
            style={[styles.wrapper, animatedStyle, style]}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled, busy: loading }}
            {...props}
        >
            {isSecondary || isGhost ? (
                <Animated.View
                    style={[
                        styles.button,
                        isGhost ? styles.buttonGhost : styles.buttonSecondary,
                        isDisabled && styles.buttonDisabled,
                    ]}
                >
                    {content}
                </Animated.View>
            ) : (
                <LinearGradient
                    colors={isDisabled ? [COLORS.textLight, COLORS.textLight] : GRADIENTS.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.button}
                >
                    {content}
                </LinearGradient>
            )}
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
    },
    button: {
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    buttonSecondary: {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    buttonGhost: {
        backgroundColor: COLORS.surfaceAlt,
        borderWidth: 0,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    text: {
        fontSize: FONT_SIZE.md,
        fontWeight: "700",
    },
    textPrimary: {
        color: COLORS.surface,
    },
    textSecondary: {
        color: COLORS.primary,
    },
});

export default Button;
