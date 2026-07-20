import { Pressable, StyleSheet, Text, type PressableProps, type TextStyle } from 'react-native';
import type { ReactNode } from 'react';
import { colors } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost';

export function Button({
  title,
  variant = 'primary',
  style,
  ...rest
}: PressableProps & { title: string; variant?: Variant }) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        pressed && styles.pressed,
        style as object,
      ]}
      {...rest}
    >
      <Text
        style={[
          styles.label,
          variant === 'secondary' && styles.labelSecondary,
          variant === 'ghost' && styles.labelGhost,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function ScreenTitle({ children, style }: { children: string; style?: TextStyle }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Body({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return <Text style={[styles.body, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  primary: { backgroundColor: colors.emerald },
  secondary: {
    backgroundColor: colors.navyElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: { backgroundColor: 'transparent' },
  pressed: { opacity: 0.85 },
  label: { color: colors.text, fontSize: 16, fontWeight: '700' },
  labelSecondary: { color: colors.text },
  labelGhost: { color: colors.emerald },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  body: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
});
