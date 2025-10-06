import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import CosumarLogo from '@/components/CosumarLogo';
import { COSUMAR_COLORS } from '@/constants/colors';

export default function LoginScreen() {
  const { login } = useAuth();
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!matricule || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    const result = await login(matricule.toUpperCase(), password);
    setIsLoading(false);

    if (result.success && result.user) {
      if (result.user.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/employee/home');
      }
    } else {
      Alert.alert('Erreur', result.error || 'Une erreur est survenue');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Connexion',
          headerStyle: { backgroundColor: COSUMAR_COLORS.primary },
          headerTintColor: COSUMAR_COLORS.white,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <CosumarLogo size={150} />
        <Text style={styles.title}>Connexion Employé</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Matricule</Text>
            <TextInput
              style={styles.input}
              value={matricule}
              onChangeText={setMatricule}
              placeholder="Votre matricule"
              autoCapitalize="characters"
              testID="input-matricule"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Votre mot de passe"
              secureTextEntry
              testID="input-password"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            testID="button-login"
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/employee/register')}
            testID="button-go-to-register"
          >
            <Text style={styles.linkText}>Pas encore de compte ? S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COSUMAR_COLORS.white,
  },
  contentContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: COSUMAR_COLORS.primary,
    marginTop: 24,
    marginBottom: 32,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COSUMAR_COLORS.darkGray,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COSUMAR_COLORS.gray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: COSUMAR_COLORS.white,
  },
  button: {
    backgroundColor: COSUMAR_COLORS.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COSUMAR_COLORS.white,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: COSUMAR_COLORS.primary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
