import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timeout);
  }, [toast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <View style={[styles.toast, styles[toast.type], Shadow.card]}>
          <Text style={styles.message}>{toast.message}</Text>
        </View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: Spacing.containerPadding,
    right: Spacing.containerPadding,
    bottom: 28,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 2000,
  },
  success: {
    backgroundColor: '#065f46',
  },
  error: {
    backgroundColor: Colors.error,
  },
  info: {
    backgroundColor: Colors.inverseSurface,
  },
  message: {
    color: Colors.inverseOnSurface,
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodyMain,
    lineHeight: 20,
  },
});
