import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { axiosInstance } from '@/services/api';

/**
 * AxiosTokenInjector
 *
 * This component must live inside <ClerkProvider>.
 * It registers a request interceptor that fetches a fresh Clerk JWT
 * before every Axios request, ensuring tokens never expire mid-session.
 */
export function AxiosTokenInjector() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const interceptorId = axiosInstance.interceptors.request.use(async (config) => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (err) {
          console.warn('[AxiosTokenInjector] Could not get fresh token:', err);
        }
      }
      return config;
    });

    // Clean up interceptor when component unmounts or auth changes
    return () => {
      axiosInstance.interceptors.request.eject(interceptorId);
    };
  }, [getToken, isSignedIn]);

  return null; // This component renders nothing
}
