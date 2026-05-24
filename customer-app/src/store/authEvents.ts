type AuthExpiredListener = () => void;

const listeners = new Set<AuthExpiredListener>();

export const subscribeAuthExpired = (listener: AuthExpiredListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const notifyAuthExpired = () => {
  listeners.forEach((listener) => listener());
};
