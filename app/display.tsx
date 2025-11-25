import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { ArrowLeft } from 'lucide-react-native';
import CosumarLogo from '@/components/CosumarLogo';
import { usePresence } from '@/contexts/PresenceContext';
import { COSUMAR_COLORS } from '@/constants/colors';

export default function DisplayScreen() {
  const { dailyToken } = usePresence();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const qrValue = dailyToken
    ? `${Platform.OS === 'web' ? window.location.origin : 'exp://'}?token=${dailyToken.token}`
    : '';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.background}>
        <SafeAreaView style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft size={24} color={COSUMAR_COLORS.white} />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        
        <View style={styles.header}>
          <CosumarLogo size={200} />
          <Text style={styles.title}>Système de Pointage</Text>
          <Text style={styles.subtitle}>Scannez le QR Code pour pointer</Text>
        </View>

        <View style={styles.qrContainer}>
          {dailyToken && (
            <>
              <View style={styles.qrWrapper}>
                <QRCode value={qrValue} size={300} />
              </View>
              <View style={styles.tokenInfo}>
                <Text style={styles.tokenLabel}>Token du jour</Text>
                <Text style={styles.tokenValue}>{dailyToken.token}</Text>
                <Text style={styles.dateText}>
                  {new Date(dailyToken.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.timeText}>{currentTime}</Text>
          <Text style={styles.footerText}>
            Le QR Code est renouvelé automatiquement chaque jour à minuit
          </Text>
        </View>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: COSUMAR_COLORS.white,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: COSUMAR_COLORS.darkGray,
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    gap: 32,
  },
  qrWrapper: {
    padding: 24,
    backgroundColor: COSUMAR_COLORS.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  tokenInfo: {
    alignItems: 'center',
    gap: 8,
  },
  tokenLabel: {
    fontSize: 18,
    color: COSUMAR_COLORS.darkGray,
    fontWeight: '600' as const,
  },
  tokenValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.secondary,
    letterSpacing: 2,
  },
  dateText: {
    fontSize: 20,
    color: COSUMAR_COLORS.darkGray,
    textTransform: 'capitalize',
  },
  footer: {
    alignItems: 'center',
    gap: 12,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.primary,
  },
  footerText: {
    fontSize: 16,
    color: COSUMAR_COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COSUMAR_COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  backButtonText: {
    color: COSUMAR_COLORS.white,
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
});
