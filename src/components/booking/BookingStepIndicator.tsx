import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

const steps = ['Thông tin xe', 'Xác thực', 'Thanh toán'];

export const BookingStepIndicator = ({ currentStep }: { currentStep: 1 | 2 | 3 }) => (
  <View style={styles.container}>
    {steps.map((label, index) => {
      const stepNumber = (index + 1) as 1 | 2 | 3;
      const isDone = stepNumber < currentStep;
      const isActive = stepNumber === currentStep;

      return (
        <React.Fragment key={label}>
          <View style={styles.step}>
            <View style={[styles.circle, (isDone || isActive) && styles.circleActive]}>
              {isDone ? (
                <Ionicons name="checkmark" size={14} color={Colors.onPrimary} />
              ) : (
                <Text style={[styles.stepNumber, isActive && styles.stepNumberActive]}>
                  {stepNumber}
                </Text>
              )}
            </View>
            <Text
              style={[styles.label, isActive && styles.labelActive]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.86}
            >
              {label}
            </Text>
          </View>
          {stepNumber < steps.length && (
            <View style={[styles.line, stepNumber < currentStep && styles.lineActive]} />
          )}
        </React.Fragment>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: Spacing.stackMd,
    flexDirection: 'row',
    alignItems: 'center',
  },
  step: { width: 78, alignItems: 'center', gap: 6 },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: { backgroundColor: Colors.primaryContainer },
  stepNumber: {
    fontFamily: FontFamilies.sansBold,
    fontSize: FontSizes.labelSmBold,
    color: Colors.onSurfaceVariant,
  },
  stepNumberActive: { color: Colors.onPrimary },
  label: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: 11,
    lineHeight: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    width: '100%',
  },
  labelActive: {
    fontFamily: FontFamilies.sansSemiBold,
    color: Colors.primaryContainer,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.outlineVariant,
    marginHorizontal: 2,
    marginBottom: 20,
  },
  lineActive: { backgroundColor: Colors.primaryContainer },
});
