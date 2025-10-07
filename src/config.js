export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8081',
  ENDPOINTS: {
    JOBS: '/api/jobs',
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    UPDATE_PASSWORD: '/api/auth/update-password',
    DELETE_ACCOUNT: '/api/auth/delete-account',
    SKILLS: '/api/skills',
    ANALYSIS: '/api/analysis'
  }
};
