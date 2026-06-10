import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Heights, Shadow } from '../../theme/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        isPrimary && Shadow.primaryButton,
        (disabled || isLoading) && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          color={isPrimary ? Colors.onPrimary : Colors.primary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary ? styles.textPrimary : styles.textSecondary,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: Heights.button,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  primary: {
    backgroundColor: Colors.primaryContainer,
  },
  secondary: {
    backgroundColor: Colors.surfaceContainerLow,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    letterSpacing: 0.1,
  },
  textPrimary: {
    color: Colors.onPrimary,
  },
  textSecondary: {
    color: Colors.onSurface,
  },
});
