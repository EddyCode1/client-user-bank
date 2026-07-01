import { useEffect, useRef, useState } from "react";
import { TextInput, View, Text, StyleSheet } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withRepeat,
} from "react-native-reanimated";
import { COLORS, SPACING, FONT_SIZE, RADIUS } from "../constants/theme";

const Input = ({ label, error, onFocus, onBlur, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    const focusProgress = useSharedValue(0);
    const shakeX = useSharedValue(0);
    const wasError = useRef(false);

    useEffect(() => {
        if (error && !wasError.current) {
            shakeX.value = withSequence(
                withTiming(-6, { duration: 45 }),
                withRepeat(withTiming(6, { duration: 90 }), 3, true),
                withTiming(0, { duration: 45 }),
            );
        }
        wasError.current = !!error;
    }, [error]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeX.value }],
        borderColor: error
            ? COLORS.error
            : focusProgress.value
                ? COLORS.primary
                : COLORS.border,
        borderWidth: withTiming(error || focusProgress.value ? 1.5 : 1, {
            duration: 150,
        }),
    }));

    const handleFocus = (e) => {
        setIsFocused(true);
        focusProgress.value = withTiming(1, { duration: 150 });
        onFocus?.(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        focusProgress.value = withTiming(0, { duration: 150 });
        onBlur?.(e);
    };

    return (
        <View style={styles.container}>
            {label && (
                <Text style={[styles.label, isFocused && styles.labelFocused]}>
                    {label}
                </Text>
            )}
            <Animated.View style={[styles.inputWrapper, containerStyle]}>
                <TextInput
                    style={styles.input}
                    placeholderTextColor={COLORS.textLight}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...props}
                />
            </Animated.View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
        width: "100%",
    },
    label: {
        fontSize: FONT_SIZE.sm,
        fontWeight: "600",
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    labelFocused: {
        color: COLORS.primary,
    },
    inputWrapper: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm + 2,
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
    },
    errorText: {
        color: COLORS.error,
        fontSize: FONT_SIZE.xs,
        marginTop: SPACING.xs,
    },
});

export default Input;
