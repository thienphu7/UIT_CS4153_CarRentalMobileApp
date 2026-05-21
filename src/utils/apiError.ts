export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Không thể kết nối máy chủ. Vui lòng thử lại.'
) => {
  const err = error as {
    response?: { data?: { message?: string | string[]; error?: string } };
    message?: string;
  };
  const message = err.response?.data?.message;

  if (Array.isArray(message)) return message.join('\n');
  if (typeof message === 'string' && message.trim()) return message;
  if (err.response?.data?.error) return err.response.data.error;
  if (err.message) return err.message;

  return fallback;
};
