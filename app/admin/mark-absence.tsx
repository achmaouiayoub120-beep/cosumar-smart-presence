import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { usePresence } from '@/contexts/PresenceContext';
import { COSUMAR_COLORS } from '@/constants/colors';
import { User } from '@/types';

export default function MarkAbsenceScreen() {
  const { getAllUsers } = useAuth();
  const { markManualPresence } = usePresence();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatut, setSelectedStatut] = useState<'Présent' | 'Absent' | 'Retard'>(
    'Absent'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const allUsers = getAllUsers().filter((u) => u.role === 'employee');
  const filteredUsers = allUsers.filter(
    (u) =>
      u.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.matricule.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMarkPresence = async () => {
    if (!selectedUser) {
      Alert.alert('Erreur', 'Veuillez sélectionner un employé');
      return;
    }

    const result = await markManualPresence(
      selectedUser.matricule,
      selectedUser.nom,
      selectedUser.prenom,
      selectedUser.departement,
      selectedUser.metier,
      selectedDate,
      selectedStatut
    );

    if (result.success) {
      Alert.alert('Succès', `Statut "${selectedStatut}" enregistré pour ${selectedUser.prenom} ${selectedUser.nom}`, [
        {
          text: 'OK',
          onPress: () => {
            setSelectedUser(null);
            setSearchQuery('');
          },
        },
      ]);
    } else {
      Alert.alert('Erreur', result.error || 'Une erreur est survenue');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Marquer Absence/Présence',
          headerStyle: { backgroundColor: COSUMAR_COLORS.primary },
          headerTintColor: COSUMAR_COLORS.white,
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rechercher un employé</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Nom, prénom ou matricule..."
            testID="input-search"
          />

          {searchQuery.length > 0 && (
            <ScrollView style={styles.usersList}>
              {filteredUsers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    styles.userCard,
                    selectedUser?.id === user.id && styles.userCardSelected,
                  ]}
                  onPress={() => setSelectedUser(user)}
                >
                  <Text style={styles.userName}>
                    {user.prenom} {user.nom}
                  </Text>
                  <Text style={styles.userInfo}>
                    {user.matricule} - {user.departement}
                  </Text>
                  <Text style={styles.userMetier}>{user.metier}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {selectedUser && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Employé sélectionné</Text>
              <View style={styles.selectedUserCard}>
                <Text style={styles.selectedUserName}>
                  {selectedUser.prenom} {selectedUser.nom}
                </Text>
                <Text style={styles.selectedUserInfo}>
                  Matricule: {selectedUser.matricule}
                </Text>
                <Text style={styles.selectedUserInfo}>
                  Département: {selectedUser.departement}
                </Text>
                <Text style={styles.selectedUserInfo}>Métier: {selectedUser.metier}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date</Text>
              <TextInput
                style={styles.input}
                value={selectedDate}
                onChangeText={setSelectedDate}
                placeholder="YYYY-MM-DD"
                testID="input-date"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Statut</Text>
              <View style={styles.statutButtons}>
                {(['Présent', 'Absent', 'Retard'] as const).map((statut) => (
                  <TouchableOpacity
                    key={statut}
                    style={[
                      styles.statutButton,
                      selectedStatut === statut && styles.statutButtonActive,
                      statut === 'Présent' && styles.statutButtonPresent,
                      statut === 'Absent' && styles.statutButtonAbsent,
                      statut === 'Retard' && styles.statutButtonRetard,
                    ]}
                    onPress={() => setSelectedStatut(statut)}
                  >
                    <Text
                      style={[
                        styles.statutButtonText,
                        selectedStatut === statut && styles.statutButtonTextActive,
                      ]}
                    >
                      {statut}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleMarkPresence}
              testID="button-submit"
            >
              <Text style={styles.submitButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COSUMAR_COLORS.lightGray,
  },
  section: {
    backgroundColor: COSUMAR_COLORS.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.primary,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: COSUMAR_COLORS.gray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  usersList: {
    maxHeight: 300,
  },
  userCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COSUMAR_COLORS.gray,
    marginBottom: 8,
    gap: 4,
  },
  userCardSelected: {
    borderColor: COSUMAR_COLORS.primary,
    borderWidth: 2,
    backgroundColor: COSUMAR_COLORS.lightGray,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COSUMAR_COLORS.black,
  },
  userInfo: {
    fontSize: 14,
    color: COSUMAR_COLORS.darkGray,
  },
  userMetier: {
    fontSize: 12,
    color: COSUMAR_COLORS.gray,
  },
  selectedUserCard: {
    backgroundColor: COSUMAR_COLORS.lightGray,
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  selectedUserName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.primary,
  },
  selectedUserInfo: {
    fontSize: 14,
    color: COSUMAR_COLORS.darkGray,
  },
  input: {
    borderWidth: 1,
    borderColor: COSUMAR_COLORS.gray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  statutButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  statutButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COSUMAR_COLORS.gray,
    alignItems: 'center',
  },
  statutButtonActive: {
    borderWidth: 3,
  },
  statutButtonPresent: {
    borderColor: COSUMAR_COLORS.success,
  },
  statutButtonAbsent: {
    borderColor: COSUMAR_COLORS.error,
  },
  statutButtonRetard: {
    borderColor: COSUMAR_COLORS.warning,
  },
  statutButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COSUMAR_COLORS.darkGray,
  },
  statutButtonTextActive: {
    fontWeight: '700' as const,
  },
  submitButton: {
    backgroundColor: COSUMAR_COLORS.secondary,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: COSUMAR_COLORS.white,
    fontSize: 18,
    fontWeight: '700' as const,
  },
});
