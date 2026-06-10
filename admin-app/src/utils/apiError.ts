const API_ERROR_TRANSLATIONS: Record<string, string> = {
  'car is not available for the selected dates': 'Xe không còn trống trong khoảng thời gian đã chọn.',
  'car is not available': 'Xe hiện không có sẵn.',
  'invalid credentials': 'Email hoặc mật khẩu không đúng.',
  'email already exists': 'Email đã được sử dụng.',
  'user already exists': 'Tài khoản đã tồn tại.',
  'unauthorized': 'Bạn cần đăng nhập để tiếp tục.',
  'forbidden': 'Bạn không có quyền thực hiện thao tác này.',
  'not found': 'Không tìm thấy dữ liệu.',
  'network error': 'Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.',
};

const normalizeErrorText = (message: string) => message.trim().toLowerCase();

const translateApiErrorMessage = (message: string) => {
  const normalized = normalizeErrorText(message);
  return API_ERROR_TRANSLATIONS[normalized] ?? message;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Không thể kết nối máy chủ. Vui lòng thử lại.'
) => {
  const err = error as {
    response?: { data?: { message?: string | string[]; error?: string } };
    message?: string;
  };
  const message = err.response?.data?.message;

  if (Array.isArray(message)) return message.map(translateApiErrorMessage).join('\n');
  if (typeof message === 'string' && message.trim()) return translateApiErrorMessage(message);
  if (err.response?.data?.error) return translateApiErrorMessage(err.response.data.error);
  if (err.message) return translateApiErrorMessage(err.message);

  return fallback;
};
