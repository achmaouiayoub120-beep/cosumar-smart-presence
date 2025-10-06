import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Search,
  Filter,
  Download,
  LogOut,
  UserPlus,
  BarChart3,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { usePresence } from '@/contexts/PresenceContext';
import { COSUMAR_COLORS } from '@/constants/colors';
import { Presence } from '@/types';

export default function AdminDashboardScreen() {
  const { currentUser, logout, getAllUsers } = useAuth();
  const { getAllPresences, getPresencesByDate } = usePresence();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartement, setSelectedDepartement] = useState('Tous');
  const [selectedStatut, setSelectedStatut] = useState('Tous');

  const allPresences = getAllPresences();
  const allUsers = getAllUsers();

  const departements = useMemo(() => {
    const depts = new Set(allUsers.map((u) => u.departement));
    return ['Tous', ...Array.from(depts)];
  }, [allUsers]);

  const filteredPresences = useMemo(() => {
    return allPresences.filter((p) => {
      const matchesSearch =
        p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.matricule.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDate = p.date === selectedDate;
      const matchesDept =
        selectedDepartement === 'Tous' || p.departement === selectedDepartement;
      const matchesStatut = selectedStatut === 'Tous' || p.statut === selectedStatut;

      return matchesSearch && matchesDate && matchesDept && matchesStatut;
    });
  }, [allPresences, searchQuery, selectedDate, selectedDepartement, selectedStatut]);

  const todayPresences = getPresencesByDate(new Date().toISOString().split('T')[0]);
  const presentCount = todayPresences.filter((p) => p.statut === 'Présent').length;
  const absentCount = allUsers.filter((u) => u.role === 'employee').length - presentCount;

  const handleExportCSV = () => {
    const csvHeader = 'Matricule,Nom,Prénom,Département,Métier,Date,Heure,Statut\n';
    const csvData = filteredPresences
      .map(
        (p) =>
          `${p.matricule},${p.nom},${p.prenom},${p.departement},${p.metier},${p.date},${p.heure},${p.statut}`
      )
      .join('\n');

    const csv = csvHeader + csvData;

    if (Platform.OS === 'web') {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presences_${selectedDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      Alert.alert('Succès', 'Export CSV téléchargé');
    } else {
      Alert.alert('Export CSV', csv);
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

  const renderPresenceRow = (item: Presence) => {
    const statusColor =
      item.statut === 'Présent'
        ? COSUMAR_COLORS.success
        : item.statut === 'Retard'
        ? COSUMAR_COLORS.warning
        : COSUMAR_COLORS.error;

    return (
      <View key={item.id} style={styles.tableRow}>
        <Text style={[styles.tableCell, styles.cellMatricule]}>{item.matricule}</Text>
        <Text style={[styles.tableCell, styles.cellName]}>
          {item.prenom} {item.nom}
        </Text>
        <Text style={[styles.tableCell, styles.cellDept]}>{item.departement}</Text>
        <Text style={[styles.tableCell, styles.cellTime]}>{item.heure}</Text>
        <View style={[styles.tableCell, styles.cellStatus]}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.statut}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Dashboard Admin',
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
          <Text style={styles.welcomeText}>
            Bienvenue, {currentUser?.prenom} {currentUser?.nom}
          </Text>
          <Text style={styles.roleText}>Administrateur RH</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{presentCount}</Text>
            <Text style={styles.statLabel}>Présents aujourd&apos;hui</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: COSUMAR_COLORS.error }]}>
              {absentCount}
            </Text>
            <Text style={styles.statLabel}>Absents</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{allUsers.filter((u) => u.role === 'employee').length}</Text>
            <Text style={styles.statLabel}>Total employés</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/admin/mark-absence')}
          >
            <UserPlus size={20} color={COSUMAR_COLORS.white} />
            <Text style={styles.actionButtonText}>Marquer absence</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleExportCSV}>
            <Download size={20} color={COSUMAR_COLORS.white} />
            <Text style={styles.actionButtonText}>Export CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/admin/stats')}
          >
            <BarChart3 size={20} color={COSUMAR_COLORS.white} />
            <Text style={styles.actionButtonText}>Statistiques</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filtersContainer}>
          <View style={styles.searchContainer}>
            <Search size={20} color={COSUMAR_COLORS.gray} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Rechercher par nom ou matricule..."
              testID="input-search"
            />
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Date:</Text>
              <TextInput
                style={styles.filterInput}
                value={selectedDate}
                onChangeText={setSelectedDate}
                placeholder="YYYY-MM-DD"
                testID="input-date"
              />
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Département:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {departements.map((dept) => (
                  <TouchableOpacity
                    key={dept}
                    style={[
                      styles.filterChip,
                      selectedDepartement === dept && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedDepartement(dept)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedDepartement === dept && styles.filterChipTextActive,
                      ]}
                    >
                      {dept}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Statut:</Text>
              <View style={styles.filterChipsRow}>
                {['Tous', 'Présent', 'Absent', 'Retard'].map((statut) => (
                  <TouchableOpacity
                    key={statut}
                    style={[
                      styles.filterChip,
                      selectedStatut === statut && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedStatut(statut)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedStatut === statut && styles.filterChipTextActive,
                      ]}
                    >
                      {statut}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.tableContainer}>
          <Text style={styles.tableTitle}>
            Liste des présences ({filteredPresences.length})
          </Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.cellMatricule]}>Matricule</Text>
              <Text style={[styles.tableHeaderCell, styles.cellName]}>Nom</Text>
              <Text style={[styles.tableHeaderCell, styles.cellDept]}>Département</Text>
              <Text style={[styles.tableHeaderCell, styles.cellTime]}>Heure</Text>
              <Text style={[styles.tableHeaderCell, styles.cellStatus]}>Statut</Text>
            </View>

            {filteredPresences.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Filter size={48} color={COSUMAR_COLORS.gray} />
                <Text style={styles.emptyText}>Aucune présence trouvée</Text>
              </View>
            ) : (
              <ScrollView style={styles.tableBody}>
                {filteredPresences.map(renderPresenceRow)}
              </ScrollView>
            )}
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
    gap: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.primary,
  },
  roleText: {
    fontSize: 16,
    color: COSUMAR_COLORS.darkGray,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COSUMAR_COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.secondary,
  },
  statLabel: {
    fontSize: 12,
    color: COSUMAR_COLORS.darkGray,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COSUMAR_COLORS.primary,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: COSUMAR_COLORS.white,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  filtersContainer: {
    backgroundColor: COSUMAR_COLORS.white,
    padding: 16,
    gap: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COSUMAR_COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  filterRow: {
    gap: 16,
  },
  filterItem: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COSUMAR_COLORS.darkGray,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: COSUMAR_COLORS.gray,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COSUMAR_COLORS.lightGray,
    borderWidth: 1,
    borderColor: COSUMAR_COLORS.gray,
  },
  filterChipActive: {
    backgroundColor: COSUMAR_COLORS.primary,
    borderColor: COSUMAR_COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: COSUMAR_COLORS.darkGray,
  },
  filterChipTextActive: {
    color: COSUMAR_COLORS.white,
    fontWeight: '600' as const,
  },
  tableContainer: {
    backgroundColor: COSUMAR_COLORS.white,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.primary,
    marginBottom: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: COSUMAR_COLORS.gray,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COSUMAR_COLORS.primary,
    padding: 12,
  },
  tableHeaderCell: {
    color: COSUMAR_COLORS.white,
    fontSize: 12,
    fontWeight: '700' as const,
  },
  tableBody: {
    maxHeight: 400,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COSUMAR_COLORS.lightGray,
  },
  tableCell: {
    fontSize: 12,
    color: COSUMAR_COLORS.darkGray,
  },
  cellMatricule: {
    width: 80,
  },
  cellName: {
    flex: 1,
  },
  cellDept: {
    width: 100,
  },
  cellTime: {
    width: 70,
  },
  cellStatus: {
    width: 80,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COSUMAR_COLORS.white,
    fontSize: 10,
    fontWeight: '700' as const,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COSUMAR_COLORS.gray,
  },
});
