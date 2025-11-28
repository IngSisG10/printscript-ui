import { useEffect, useRef } from 'react';
import { useAuth } from '../auth/useAuth';
import { httpUserClient } from '../api/httpClient';

/**
 * Hook para sincronizar el usuario con el backend después del login de Auth0
 * Se ejecuta automáticamente cuando el usuario está autenticado.
 * Solo envía el token de Auth0 en el header; el backend extrae la información del JWT.
 * 
 * @param endpoint - Endpoint del backend para sincronizar el usuario (default: '/users/sync')
 */
export const useUserSync = (endpoint: string = '/users/sync') => {
  const { isAuthenticated } = useAuth();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    const syncUser = async () => {
      // Solo sincronizar si está autenticado y no se ha sincronizado ya
      if (!isAuthenticated || hasSyncedRef.current) {
        return;
      }

      try {
        // Pequeño delay para asegurar que el token getter esté registrado
        // Esto evita condiciones de carrera con AuthProviderConfig
        await new Promise(resolve => setTimeout(resolve, 100));

        // Llamar al endpoint de sincronización
        // El token se envía automáticamente en el header Authorization por httpUserClient
        // El backend extraerá la información del usuario del JWT
        await httpUserClient.post(endpoint, {});

        // Marcar como sincronizado para evitar múltiples llamadas
        hasSyncedRef.current = true;

        console.log('Usuario sincronizado exitosamente');
      } catch (error) {
        console.error('Error al sincronizar usuario:', error);
        // No marcamos como sincronizado para que pueda reintentar en el próximo render
        // Si prefieres que solo intente una vez, puedes descomentar la siguiente línea:
        // hasSyncedRef.current = true;
      }
    };

    syncUser();
  }, [isAuthenticated, endpoint]);

  // Resetear el flag cuando el usuario cierra sesión
  useEffect(() => {
    if (!isAuthenticated) {
      hasSyncedRef.current = false;
    }
  }, [isAuthenticated]);
};

