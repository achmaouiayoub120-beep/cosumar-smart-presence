import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { CheckCircle, History, LogOut, QrCode } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { usePresence } from '@/contexts/PresenceContext';
import CosumarLogo from '@/components/CosumarLogo';
import { COSUMAR_COLORS } from '@/constants/colors';

export default function EmployeeHomeScreen() {
  const { currentUser, logout } = useAuth();
  const { markPresence, dailyToken, getPresencesByMatricule } = usePresence();
  const params = useLocalSearchParams();
  const [token, setToken] = useState((params.token as string) || '');
  const [isMarking, setIsMarking] = useState(false);

  const handleMarkPresence = async () => {
    if (!currentUser) return;

    if (!token) {
      Alert.alert('Erreur', 'Veuillez entrer le token du jour');
      return;
    }

    setIsMarking(true);
    const result = await markPresence(
      currentUser.id,
      currentUser.matricule,
      currentUser.nom,
      currentUser.prenom,
      currentUser.departement,
      currentUser.metier,
      token
    );
    setIsMarking(false);

    if (result.success) {
      Alert.alert('Succès', 'Votre présence a été enregistrée avec succès !', [
        { text: 'OK' },
      ]);
      setToken('');
    } else {
      Alert.alert('Erreur', result.error || 'Une erreur est survenue');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  const myPresences = currentUser ? getPresencesByMatricule(currentUser.matricule) : [];
  const todayPresence = myPresences.find(
    (p) => p.date === new Date().toISOString().split('T')[0]
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Accueil Employé',
          headerStyle: { backgroundColor: COSUMAR_COLORS.primary },
          headerTintColor: COSUMAR_COLORS.white,
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
              <LogOut size={24} color={COSUMAR_COLORS.white} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <CosumarLogo size={100} />
          <Text style={styles.welcomeText}>
            Bienvenue, {currentUser?.prenom} {currentUser?.nom}
          </Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Matricule:</Text>
            <Text style={styles.infoValue}>{currentUser?.matricule}</Text>
            <Text style={styles.infoLabel}>Département:</Text>
            <Text style={styles.infoValue}>{currentUser?.departement}</Text>
            <Text style={styles.infoLabel}>Métier:</Text>
            <Text style={styles.infoValue}>{currentUser?.metier}</Text>
          </View>
        </View>

        {todayPresence ? (
          <View style={styles.successCard}>
            <CheckCircle size={48} color={COSUMAR_COLORS.success} />
            <Text style={styles.successTitle}>Présence enregistrée !</Text>
            <Text style={styles.successText}>
              Vous avez pointé aujourd'hui à {todayPresence.heure}
            </Text>
          </View>
        ) : (
          <View style={styles.markCard}>
            <QrCode size={48} color={COSUMAR_COLORS.primary} />
            <Text style={styles.markTitle}>Pointer ma présence</Text>
            <Text style={styles.markSubtitle}>
              Scannez le QR Code affiché à l'entrée ou entrez le token manuellement
            </Text>

            <View style={styles.tokenInput}>
              <Text style={styles.label}>Token du jour</Text>
              <TextInput
                style={styles.input}
                value={token}
                onChangeText={setToken}
                placeholder={`Ex: ${dailyToken?.token || 'TOKEN-XXX'}`}
                autoCapitalize="characters"
                testID="input-token"
              />
            </View>

            <TouchableOpacity
              style={[styles.markButton, isMarking && styles.buttonDisabled]}
              onPress={handleMarkPresence}
              disabled={isMarking}
              testID="button-mark-presence"
            >
              <CheckCircle size={24} color={COSUMAR_COLORS.white} />
              <Text style={styles.markButtonText}>
                {isMarking ? 'Enregistrement...' : 'Je suis présent'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push('/employee/history')}
          testID="button-view-history"
        >
          <History size={24} color={COSUMAR_COLORS.primary} />
          <Text style={styles.historyButtonText}>Voir mon historique</Text>
        </TouchableOpacity>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Mes statistiques</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{myPresences.length}</Text>
              <Text style={styles.statLabel}>Total pointages</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {myPresences.filter((p) => p.statut === 'Présent').length}
              </Text>
              <Text style={styles.statLabel}>Présences</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COSUMAR_COLORS.lightGray,
  },
  header: {
    backgroundColor: COSUMAR_COLORS.white,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.primary,
    textAlign: 'center',
  },
  infoCard: {
    width: '100%',
    backgroundColor: COSUMAR_COLORS.lightGray,
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COSUMAR_COLORS.darkGray,
    fontWeight: '600' as const,
  },
  infoValue: {
    fontSize: 16,
    color: COSUMAR_COLORS.black,
    marginBottom: 8,
  },
  successCard: {
    backgroundColor: COSUMAR_COLORS.white,
    margin: 16,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: COSUMAR_COLORS.success,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.success,
  },
  successText: {
    fontSize: 16,
    color: COSUMAR_COLORS.darkGray,
    textAlign: 'center',
  },
  markCard: {
    backgroundColor: COSUMAR_COLORS.white,
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 16,
  },
  markTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.primary,
  },
  markSubtitle: {
    fontSize: 14,
    color: COSUMAR_COLORS.darkGray,
    textAlign: 'center',
  },
  tokenInput: {
    width: '100%',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COSUMAR_COLORS.darkGray,
  },
  input: {
    borderWidth: 1,
    borderColor: COSUMAR_COLORS.gray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: COSUMAR_COLORS.white,
  },
  markButton: {
    backgroundColor: COSUMAR_COLORS.secondary,
    padding: 16,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  markButtonText: {
    color: COSUMAR_COLORS.white,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  historyButton: {
    backgroundColor: COSUMAR_COLORS.white,
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  historyButtonText: {
    color: COSUMAR_COLORS.primary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  statsCard: {
    backgroundColor: COSUMAR_COLORS.white,
    margin: 16,
    marginTop: 0,
    padding: 24,
    borderRadius: 12,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.primary,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.secondary,
  },
  statLabel: {
    fontSize: 14,
    color: COSUMAR_COLORS.darkGray,
  },
});
