import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { Calendar, Clock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { usePresence } from '@/contexts/PresenceContext';
import { COSUMAR_COLORS } from '@/constants/colors';
import { Presence } from '@/types';

export default function HistoryScreen() {
  const { currentUser } = useAuth();
  const { getPresencesByMatricule } = usePresence();

  const myPresences = currentUser ? getPresencesByMatricule(currentUser.matricule) : [];

  const renderPresenceItem = ({ item }: { item: Presence }) => {
    const statusColor =
      item.statut === 'Présent'
        ? COSUMAR_COLORS.success
        : item.statut === 'Retard'
        ? COSUMAR_COLORS.warning
        : COSUMAR_COLORS.error;

    return (
      <View style={styles.presenceCard}>
        <View style={styles.presenceHeader}>
          <View style={styles.dateContainer}>
            <Calendar size={20} color={COSUMAR_COLORS.primary} />
            <Text style={styles.dateText}>
              {new Date(item.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.statut}</Text>
          </View>
        </View>

        <View style={styles.presenceDetails}>
          <View style={styles.detailRow}>
            <Clock size={16} color={COSUMAR_COLORS.darkGray} />
            <Text style={styles.detailText}>Heure: {item.heure}</Text>
          </View>
          {item.markedManually && (
            <Text style={styles.manualText}>(Marqué manuellement par RH)</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Mon Historique',
          headerStyle: { backgroundColor: COSUMAR_COLORS.primary },
          headerTintColor: COSUMAR_COLORS.white,
        }}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Historique de présence</Text>
          <Text style={styles.subtitle}>
            {myPresences.length} pointage{myPresences.length > 1 ? 's' : ''} enregistré
            {myPresences.length > 1 ? 's' : ''}
          </Text>
        </View>

        {myPresences.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar size={64} color={COSUMAR_COLORS.gray} />
            <Text style={styles.emptyText}>Aucun pointage enregistré</Text>
          </View>
        ) : (
          <FlatList
            data={myPresences}
            renderItem={renderPresenceItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
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
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.primary,
  },
  subtitle: {
    fontSize: 16,
    color: COSUMAR_COLORS.darkGray,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  presenceCard: {
    backgroundColor: COSUMAR_COLORS.white,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  presenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: COSUMAR_COLORS.darkGray,
    textTransform: 'capitalize',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: COSUMAR_COLORS.white,
    fontSize: 12,
    fontWeight: '700' as const,
  },
  presenceDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: COSUMAR_COLORS.darkGray,
  },
  manualText: {
    fontSize: 12,
    color: COSUMAR_COLORS.warning,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    color: COSUMAR_COLORS.gray,
  },
});
