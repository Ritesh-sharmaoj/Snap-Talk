import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { apiMessage } from '../api/client';
import { validateAuth } from '../utils/validation';
import { useAuth } from '../context/AuthContext';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import ScreenHeader from '../components/ScreenHeader';

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const [form, setForm] = useState({ fullName: '', username: '', identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    const nextErrors = validateAuth({ ...form, mode: 'signup' });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      setLoading(true);
      await signup(form);
    } catch (error) {
      Alert.alert('Signup failed', apiMessage(error, 'Please check the form and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <ScreenHeader title="Create account" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Build your Snap Talk identity</Text>
        <Text style={styles.subtitle}>Choose a name people can search, then finish your profile setup.</Text>
        <View style={styles.form}>
          <AppInput label="Full name" icon="user" placeholder="Aarya Mehta" value={form.fullName} onChangeText={(value) => update('fullName', value)} error={errors.fullName} />
          <AppInput label="Username" icon="hash" placeholder="aarya" value={form.username} onChangeText={(value) => update('username', value)} error={errors.username} />
          <AppInput label="Email or mobile" icon="at-sign" placeholder="aarya@example.com" value={form.identifier} onChangeText={(value) => update('identifier', value)} error={errors.identifier} />
          <AppInput label="Password" icon="lock" placeholder="Minimum 6 characters" secureTextEntry value={form.password} onChangeText={(value) => update('password', value)} error={errors.password} />
          <AppButton label="Create account" loading={loading} onPress={submit} icon={<Feather name="user-plus" color={colors.card} size={18} />} />
        </View>
        <Pressable style={styles.bottom} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.bottomText}>Already have an account? <Text style={styles.link}>Log in</Text></Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.paper,
    flex: 1,
  },
  content: {
    padding: 22,
    paddingTop: 10,
  },
  title: {
    color: colors.ink,
    fontSize: 31,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: 8,
  },
  form: {
    gap: 16,
    marginTop: 28,
  },
  bottom: {
    alignItems: 'center',
    paddingVertical: 22,
  },
  bottomText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  link: {
    color: colors.ink,
    fontWeight: '900',
  },
});
