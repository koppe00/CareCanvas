import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('carecanvas_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url ?? '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
    if (error?.response?.status === 401 && typeof window !== 'undefined' && !isAuthEndpoint) {
      localStorage.removeItem('carecanvas_token');
      localStorage.removeItem('carecanvas_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (email: string, wachtwoord: string) =>
    apiClient.post('/auth/login', { email, wachtwoord }),
  register: (data: { email: string; naam: string; wachtwoord: string; rollen?: string[] }) =>
    apiClient.post('/auth/register', data),
};

export const projectsApi = {
  maakProject: (data: object) => apiClient.post('/projects', data),
  vindAlle: (params?: object) => apiClient.get('/projects', { params }),
  mijnProjecten: () => apiClient.get('/projects/mijn'),
  vindOpId: (id: string) => apiClient.get(`/projects/${id}`),
  wijzigStatus: (id: string, status: string) => apiClient.patch(`/projects/${id}/status`, { status }),
};

export const aiApi = {
  sparring: (data: object) => apiClient.post('/ai/sparring', data),
  genereerSpecs: (data: object) => apiClient.post('/ai/specs', data),
  scanCompliance: (data: object) => apiClient.post('/ai/compliance', data),
  classificeer: (tekst: string) => apiClient.post('/ai/classificeer', { tekst }),
  documentNaarElementen: (document: string) => apiClient.post('/ai/document-naar-elementen', { document }),
  afleiden: (data: { bronElement: any; doelType: string; bestaandeElementen: any[] }) =>
    apiClient.post('/ai/afleiden', data),
};

export const elementenApi = {
  vindAlle: (params?: { type?: string; status?: string; zoekterm?: string }) =>
    apiClient.get('/elementen', { params }),
  vindGoedgekeurd: () => apiClient.get('/elementen/goedgekeurd'),
  vindOpId: (id: string) => apiClient.get(`/elementen/${id}`),
  maak: (data: object) => apiClient.post('/elementen', data),
  bijwerken: (id: string, data: object) => apiClient.patch(`/elementen/${id}`, data),
  wijzigStatus: (id: string, status: string) =>
    apiClient.patch(`/elementen/${id}/status`, { status }),
  vindBerichten: (id: string) => apiClient.get(`/elementen/${id}/berichten`),
  voegBerichtToe: (id: string, tekst: string) =>
    apiClient.post(`/elementen/${id}/berichten`, { tekst }),
  vindStemmen: (id: string) => apiClient.get(`/elementen/${id}/stemmen`),
  brengtStemUit: (id: string, waarde: string, toelichting?: string) =>
    apiClient.post(`/elementen/${id}/stemmen`, { waarde, toelichting }),
  vindSignalen: (id: string) => apiClient.get(`/elementen/${id}/signalen`),
  markeerOpgelost: (id: string, signaalId: string) =>
    apiClient.patch(`/elementen/${id}/signalen/${signaalId}/opgelost`, {}),
};

export const relatiesApi = {
  vindRelaties: (id: string) => apiClient.get(`/elementen/${id}/relaties`),
  vindAlleRelaties: () => apiClient.get('/elementen/alle-relaties'),
  maakRelatie: (id: string, data: { naarElementId: string; relatieType: string }) =>
    apiClient.post(`/elementen/${id}/relaties`, data),
  verwijderRelatie: (id: string, relatieId: string) =>
    apiClient.delete(`/elementen/${id}/relaties/${relatieId}`),
};

export const libraryApi = {
  vindAlle: (params?: object) => apiClient.get('/library', { params }),
  vindOpId: (id: string) => apiClient.get(`/library/${id}`),
  fork: (id: string) => apiClient.post(`/library/${id}/fork`),
};

export const communityApi = {
  geefStempel: (data: object) => apiClient.post('/community/stempel', data),
  stempelsVoorProject: (projectId: string) => apiClient.get(`/community/stempels/${projectId}`),
  vindExperts: (rol: string) => apiClient.get('/community/experts', { params: { rol } }),
};

export default apiClient;
