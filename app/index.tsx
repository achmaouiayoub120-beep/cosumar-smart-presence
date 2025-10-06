import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Monitor, Users, Shield } from 'lucide-react-native';
import CosumarLogo from '@/components/CosumarLogo';
import { useAuth } from '@/contexts/AuthContext';
import { COSUMAR_COLORS } from '@/constants/colors';

export default function HomeScreen() {
  const { isAuthenticated, isAdmin, currentUser } = useAuth();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (isAdmin) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/employee/home');
      }
    }
  }, [isAuthenticated, isAdmin, currentUser]);

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <CosumarLogo size={180} />
          <Text style={styles.title}>COSUMAR Smart Presence</Text>
          <Text style={styles.subtitle}>Système de gestion de présence par QR Code</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonDisplay]}
            onPress={() => router.push('/display')}
            testID="button-display"
          >
            <Monitor size={32} color={COSUMAR_COLORS.white} />
            <Text style={styles.buttonTitle}>Affichage TV</Text>
            <Text style={styles.buttonSubtitle}>QR Code du jour</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonEmployee]}
            onPress={() => router.push('/employee/login')}
            testID="button-employee"
          >
            <Users size={32} color={COSUMAR_COLORS.white} />
            <Text style={styles.buttonTitle}>Espace Employé</Text>
            <Text style={styles.buttonSubtitle}>Pointer ma présence</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonAdmin]}
            onPress={() => router.push('/employee/login')}
            testID="button-admin"
          >
            <Shield size={32} color={COSUMAR_COLORS.white} />
            <Text style={styles.buttonTitle}>Espace Admin</Text>
            <Text style={styles.buttonSubtitle}>Dashboard RH</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Connectez-vous avec votre matricule pour accéder à votre espace
          </Text>
          <Text style={styles.footerTextSmall}>
            Admin par défaut: ADMIN001 / admin123
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: COSUMAR_COLORS.white,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COSUMAR_COLORS.darkGray,
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: 16,
  },
  button: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisplay: {
    backgroundColor: COSUMAR_COLORS.primary,
  },
  buttonEmployee: {
    backgroundColor: COSUMAR_COLORS.secondary,
  },
  buttonAdmin: {
    backgroundColor: COSUMAR_COLORS.darkGray,
  },
  buttonTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.white,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: COSUMAR_COLORS.white,
    opacity: 0.9,
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: COSUMAR_COLORS.darkGray,
    textAlign: 'center',
  },
  footerTextSmall: {
    fontSize: 12,
    color: COSUMAR_COLORS.gray,
    textAlign: 'center',
  },
});
