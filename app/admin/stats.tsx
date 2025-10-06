import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { TrendingUp, Users, Calendar } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { usePresence } from '@/contexts/PresenceContext';
import { COSUMAR_COLORS } from '@/constants/colors';

export default function StatsScreen() {
  const { getAllUsers } = useAuth();
  const { getAllPresences } = usePresence();

  const allUsers = getAllUsers().filter((u) => u.role === 'employee');
  const allPresences = getAllPresences();

  const stats = useMemo(() => {
    const totalEmployees = allUsers.length;
    const totalPresences = allPresences.length;
    const presentCount = allPresences.filter((p) => p.statut === 'Présent').length;
    const absentCount = allPresences.filter((p) => p.statut === 'Absent').length;
    const retardCount = allPresences.filter((p) => p.statut === 'Retard').length;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const presencesByDay = last7Days.map((date) => {
      const dayPresences = allPresences.filter((p) => p.date === date);
      const present = dayPresences.filter((p) => p.statut === 'Présent').length;
      return {
        date,
        present,
        total: totalEmployees,
        percentage: totalEmployees > 0 ? Math.round((present / totalEmployees) * 100) : 0,
      };
    });

    const departementStats = allUsers.reduce((acc, user) => {
      const dept = user.departement;
      if (!acc[dept]) {
        acc[dept] = { total: 0, present: 0 };
      }
      acc[dept].total += 1;

      const userPresences = allPresences.filter(
        (p) => p.matricule === user.matricule && p.statut === 'Présent'
      );
      acc[dept].present += userPresences.length;

      return acc;
    }, {} as Record<string, { total: number; present: number }>);

    return {
      totalEmployees,
      totalPresences,
      presentCount,
      absentCount,
      retardCount,
      presencesByDay,
      departementStats,
    };
  }, [allUsers, allPresences]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Statistiques',
          headerStyle: { backgroundColor: COSUMAR_COLORS.primary },
          headerTintColor: COSUMAR_COLORS.white,
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={24} color={COSUMAR_COLORS.primary} />
            <Text style={styles.sectionTitle}>Vue d&apos;ensemble</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalEmployees}</Text>
              <Text style={styles.statLabel}>Total employés</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalPresences}</Text>
              <Text style={styles.statLabel}>Total pointages</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COSUMAR_COLORS.success }]}>
                {stats.presentCount}
              </Text>
              <Text style={styles.statLabel}>Présences</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COSUMAR_COLORS.error }]}>
                {stats.absentCount}
              </Text>
              <Text style={styles.statLabel}>Absences</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COSUMAR_COLORS.warning }]}>
                {stats.retardCount}
              </Text>
              <Text style={styles.statLabel}>Retards</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={24} color={COSUMAR_COLORS.primary} />
            <Text style={styles.sectionTitle}>Taux de présence (7 derniers jours)</Text>
          </View>

          <View style={styles.chartContainer}>
            {stats.presencesByDay.map((day) => (
              <View key={day.date} style={styles.chartRow}>
                <Text style={styles.chartLabel}>
                  {new Date(day.date).toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <View style={styles.chartBarContainer}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        width: `${day.percentage}%`,
                        backgroundColor:
                          day.percentage >= 80
                            ? COSUMAR_COLORS.success
                            : day.percentage >= 50
                            ? COSUMAR_COLORS.warning
                            : COSUMAR_COLORS.error,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.chartValue}>
                  {day.present}/{day.total} ({day.percentage}%)
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={24} color={COSUMAR_COLORS.primary} />
            <Text style={styles.sectionTitle}>Statistiques par département</Text>
          </View>

          <View style={styles.deptContainer}>
            {Object.entries(stats.departementStats).map(([dept, data]) => (
              <View key={dept} style={styles.deptCard}>
                <Text style={styles.deptName}>{dept}</Text>
                <View style={styles.deptStats}>
                  <View style={styles.deptStatItem}>
                    <Text style={styles.deptStatValue}>{data.total}</Text>
                    <Text style={styles.deptStatLabel}>Employés</Text>
                  </View>
                  <View style={styles.deptStatItem}>
                    <Text style={[styles.deptStatValue, { color: COSUMAR_COLORS.success }]}>
                      {data.present}
                    </Text>
                    <Text style={styles.deptStatLabel}>Pointages</Text>
                  </View>
                  <View style={styles.deptStatItem}>
                    <Text style={[styles.deptStatValue, { color: COSUMAR_COLORS.primary }]}>
                      {data.total > 0 ? Math.round((data.present / data.total) * 100) / 100 : 0}
                    </Text>
                    <Text style={styles.deptStatLabel}>Moy/employé</Text>
                  </View>
                </View>
              </View>
            ))}
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
  section: {
    backgroundColor: COSUMAR_COLORS.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: COSUMAR_COLORS.lightGray,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.secondary,
  },
  statLabel: {
    fontSize: 12,
    color: COSUMAR_COLORS.darkGray,
    textAlign: 'center',
  },
  chartContainer: {
    gap: 12,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chartLabel: {
    width: 60,
    fontSize: 12,
    color: COSUMAR_COLORS.darkGray,
  },
  chartBarContainer: {
    flex: 1,
    height: 24,
    backgroundColor: COSUMAR_COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
    borderRadius: 4,
  },
  chartValue: {
    width: 80,
    fontSize: 12,
    color: COSUMAR_COLORS.darkGray,
    textAlign: 'right',
  },
  deptContainer: {
    gap: 12,
  },
  deptCard: {
    backgroundColor: COSUMAR_COLORS.lightGray,
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  deptName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.primary,
  },
  deptStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  deptStatItem: {
    alignItems: 'center',
    gap: 4,
  },
  deptStatValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.secondary,
  },
  deptStatLabel: {
    fontSize: 11,
    color: COSUMAR_COLORS.darkGray,
  },
});
