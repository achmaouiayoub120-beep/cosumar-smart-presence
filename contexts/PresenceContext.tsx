import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Presence, DailyToken } from '@/types';

const PRESENCE_STORAGE_KEY = '@cosumar_presence';
const TOKEN_STORAGE_KEY = '@cosumar_daily_token';

const generateDailyToken = (date: Date): string => {
  const dateStr = date.toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `TOKEN-${Math.abs(hash).toString(36).toUpperCase()}`;
};

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const [PresenceProvider, usePresence] = createContextHook(() => {
  const [presences, setPresences] = useState<Presence[]>([]);
  const [dailyToken, setDailyToken] = useState<DailyToken | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => checkAndUpdateToken(), 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [presenceData, tokenData] = await Promise.all([
        AsyncStorage.getItem(PRESENCE_STORAGE_KEY),
        AsyncStorage.getItem(TOKEN_STORAGE_KEY),
      ]);

      if (presenceData) {
        setPresences(JSON.parse(presenceData));
      }

      await checkAndUpdateToken(tokenData);
    } catch (error) {
      console.error('Error loading presence data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAndUpdateToken = async (existingTokenData?: string | null) => {
    try {
      const today = getTodayDateString();
      let tokenObj: DailyToken | null = null;

      if (existingTokenData) {
        tokenObj = JSON.parse(existingTokenData);
      }

      if (!tokenObj || tokenObj.date !== today) {
        const newToken: DailyToken = {
          date: today,
          token: generateDailyToken(new Date()),
        };
        setDailyToken(newToken);
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(newToken));
        console.log('New daily token generated:', newToken.token);
      } else {
        setDailyToken(tokenObj);
      }
    } catch (error) {
      console.error('Error updating token:', error);
    }
  };

  const markPresence = useCallback(
    async (
      userId: string,
      matricule: string,
      nom: string,
      prenom: string,
      departement: string,
      metier: string,
      token: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        if (!dailyToken || token !== dailyToken.token) {
          return { success: false, error: 'Token invalide ou expiré' };
        }

        const today = getTodayDateString();
        const alreadyMarked = presences.find(
          (p) => p.matricule === matricule && p.date === today && p.token === token
        );

        if (alreadyMarked) {
          return { success: false, error: 'Vous avez déjà pointé aujourd\'hui' };
        }

        const now = new Date();
        const heure = now.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        const newPresence: Presence = {
          id: `presence-${Date.now()}`,
          userId,
          matricule,
          nom,
          prenom,
          departement,
          metier,
          date: today,
          heure,
          token,
          statut: 'Présent',
          markedManually: false,
          createdAt: now.toISOString(),
        };

        const updatedPresences = [...presences, newPresence];
        setPresences(updatedPresences);
        await AsyncStorage.setItem(PRESENCE_STORAGE_KEY, JSON.stringify(updatedPresences));

        return { success: true };
      } catch (error) {
        console.error('Error marking presence:', error);
        return { success: false, error: 'Erreur lors du pointage' };
      }
    },
    [presences, dailyToken]
  );

  const markManualPresence = useCallback(
    async (
      matricule: string,
      nom: string,
      prenom: string,
      departement: string,
      metier: string,
      date: string,
      statut: 'Présent' | 'Absent' | 'Retard'
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const alreadyMarked = presences.find(
          (p) => p.matricule === matricule && p.date === date
        );

        if (alreadyMarked) {
          const updatedPresences = presences.map((p) =>
            p.matricule === matricule && p.date === date
              ? { ...p, statut, markedManually: true }
              : p
          );
          setPresences(updatedPresences);
          await AsyncStorage.setItem(PRESENCE_STORAGE_KEY, JSON.stringify(updatedPresences));
        } else {
          const newPresence: Presence = {
            id: `presence-manual-${Date.now()}`,
            userId: '',
            matricule,
            nom,
            prenom,
            departement,
            metier,
            date,
            heure: new Date().toLocaleTimeString('fr-FR'),
            token: dailyToken?.token || '',
            statut,
            markedManually: true,
            createdAt: new Date().toISOString(),
          };

          const updatedPresences = [...presences, newPresence];
          setPresences(updatedPresences);
          await AsyncStorage.setItem(PRESENCE_STORAGE_KEY, JSON.stringify(updatedPresences));
        }

        return { success: true };
      } catch (error) {
        console.error('Error marking manual presence:', error);
        return { success: false, error: 'Erreur lors du marquage manuel' };
      }
    },
    [presences, dailyToken]
  );

  const getPresencesByDate = useCallback(
    (date: string): Presence[] => {
      return presences.filter((p) => p.date === date);
    },
    [presences]
  );

  const getPresencesByMatricule = useCallback(
    (matricule: string): Presence[] => {
      return presences.filter((p) => p.matricule === matricule).sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    },
    [presences]
  );

  const getPresencesByDepartement = useCallback(
    (departement: string): Presence[] => {
      return presences.filter((p) => p.departement === departement);
    },
    [presences]
  );

  const getAllPresences = useCallback((): Presence[] => {
    return presences.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [presences]);

  return useMemo(
    () => ({
      presences,
      dailyToken,
      isLoading,
      markPresence,
      markManualPresence,
      getPresencesByDate,
      getPresencesByMatricule,
      getPresencesByDepartement,
      getAllPresences,
    }),
    [
      presences,
      dailyToken,
      isLoading,
      markPresence,
      markManualPresence,
      getPresencesByDate,
      getPresencesByMatricule,
      getPresencesByDepartement,
      getAllPresences,
    ]
  );
});
