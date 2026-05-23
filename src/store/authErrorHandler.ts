import { Alert } from 'react-native';

type AuthErrorListener = (message: string) => void;

const listeners = new Set<AuthErrorListener>();

export const subscribeAuthError = (listener: AuthErrorListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const notifyAuthError = (message: string) => {
  listeners.forEach((listener) => listener(message));
};

export const handleAuthError = (status: number) => {
  if (status === 401) {
    notifyAuthError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  } else if (status === 403) {
    notifyAuthError('Bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
  }
};
