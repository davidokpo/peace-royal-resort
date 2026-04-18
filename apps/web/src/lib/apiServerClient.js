const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const normalizeApiBaseUrl = (value = '/api') => {
  const trimmed = trimTrailingSlash(value || '/api');

  if (!trimmed) {
    return '/api';
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    return trimmed;
  }

  return `/${trimmed.replace(/^\.?\/+/, '')}`;
};

const API_BASE_URL = normalizeApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    '/api',
);

const apiServerClient = {
  fetch: (path, options = {}) => fetch(`${API_BASE_URL}${path}`, options),
};

export default apiServerClient;
