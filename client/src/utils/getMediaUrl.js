const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

/**
 * Converts a relative media path (e.g. /uploads/images/x.jpg) to an absolute URL.
 * If the path already starts with http, it is returned as-is.
 */
const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${SERVER_URL}${path}`;
};

export default getMediaUrl;
