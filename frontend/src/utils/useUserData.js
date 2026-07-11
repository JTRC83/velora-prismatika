/**
 * Hook para persistir datos del usuario (nombre y fecha de nacimiento)
 * en localStorage. Evita que el usuario tenga que introducirlos
 * repetidamente en cada servicio.
 *
 * Uso:
 *   const { userData, saveUserData, clearUserData } = useUserData();
 *   // userData = { name: '', birthdate: '' }
 *   saveUserData({ name: 'Ana', birthdate: '1990-05-15' });
 */

import React from 'react';

const STORAGE_KEY = 'velora_user_data';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { name: '', birthdate: '' };
    const parsed = JSON.parse(raw);
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      birthdate: typeof parsed.birthdate === 'string' ? parsed.birthdate : '',
    };
  } catch {
    return { name: '', birthdate: '' };
  }
}

export function useUserData() {
  const [userData, setUserData] = React.useState(loadFromStorage);

  const saveUserData = React.useCallback((data) => {
    setUserData(prev => {
      const next = {
        name: data.name ?? prev.name,
        birthdate: data.birthdate ?? prev.birthdate,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage puede fallar en modo privado o si está lleno
      }
      return next;
    });
  }, []);

  const clearUserData = React.useCallback(() => {
    setUserData({ name: '', birthdate: '' });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // idem
    }
  }, []);

  return { userData, saveUserData, clearUserData };
}