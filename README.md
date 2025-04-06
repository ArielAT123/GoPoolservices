
este codigo se debe ejecutar en el frond para que el access token se renueve

   ```


    import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

async function refreshAccessToken() {
  const refreshToken = await SecureStore.getItemAsync('refresh_token');
  if (!refreshToken) return null;

  const response = await fetch(BACKEND_URL + '/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();
  if (data.accessToken) {
    await SecureStore.setItemAsync('access_token', data.accessToken);
    await SecureStore.setItemAsync('refresh_token', data.refreshToken);
    return data.accessToken;
  } else {
    console.error('Error renovando token:', data);
    return null;
  }
}

// Ejecutar cada 50 minutos para evitar que el usuario se desloguee
useEffect(() => {
  const interval = setInterval(refreshAccessToken, 50 * 60 * 1000); // 50 minutos
  return () => clearInterval(interval);
}, []);

   ```

