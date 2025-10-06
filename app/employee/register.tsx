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

export default function RegisterScreen() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    departement: '',
    metier: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !formData.matricule ||
      !formData.nom ||
      !formData.prenom ||
      !formData.departement ||
      !formData.metier ||
      !formData.email ||
      !formData.password
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    const result = await register({
      matricule: formData.matricule.toUpperCase(),
      nom: formData.nom,
      prenom: formData.prenom,
      departement: formData.departement,
      metier: formData.metier,
      email: formData.email.toLowerCase(),
      password: formData.password,
    });

    setIsLoading(false);

    if (result.success) {
      Alert.alert('Succès', 'Votre compte a été créé avec succès', [
        { text: 'OK', onPress: () => router.replace('/employee/login') },
      ]);
    } else {
      Alert.alert('Erreur', result.error || 'Une erreur est survenue');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Inscription Employé',
          headerStyle: { backgroundColor: COSUMAR_COLORS.primary },
          headerTintColor: COSUMAR_COLORS.white,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <CosumarLogo size={120} />
        <Text style={styles.title}>Créer un compte</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Matricule *</Text>
            <TextInput
              style={styles.input}
              value={formData.matricule}
              onChangeText={(text) => setFormData({ ...formData, matricule: text })}
              placeholder="Ex: EMP001"
              autoCapitalize="characters"
              testID="input-matricule"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Nom *</Text>
              <TextInput
                style={styles.input}
                value={formData.nom}
                onChangeText={(text) => setFormData({ ...formData, nom: text })}
                placeholder="Nom"
                testID="input-nom"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Prénom *</Text>
              <TextInput
                style={styles.input}
                value={formData.prenom}
                onChangeText={(text) => setFormData({ ...formData, prenom: text })}
                placeholder="Prénom"
                testID="input-prenom"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Département *</Text>
            <TextInput
              style={styles.input}
              value={formData.departement}
              onChangeText={(text) => setFormData({ ...formData, departement: text })}
              placeholder="Ex: Production, RH, Logistique"
              testID="input-departement"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Métier / Fonction *</Text>
            <TextInput
              style={styles.input}
              value={formData.metier}
              onChangeText={(text) => setFormData({ ...formData, metier: text })}
              placeholder="Ex: Technicien, Manager"
              testID="input-metier"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="email@cosumar.ma"
              keyboardType="email-address"
              autoCapitalize="none"
              testID="input-email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe *</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              placeholder="Minimum 6 caractères"
              secureTextEntry
              testID="input-password"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer le mot de passe *</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              placeholder="Confirmer le mot de passe"
              secureTextEntry
              testID="input-confirm-password"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            testID="button-register"
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Inscription...' : 'S\'inscrire'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/employee/login')}
            testID="button-go-to-login"
          >
            <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
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
    maxWidth: 500,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
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
