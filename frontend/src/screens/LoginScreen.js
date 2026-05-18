import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { validateAuth } from '../utils/validation';
import { apiMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import SnapLogo from '../components/SnapLogo';

export default function LoginScreen({ navigation }) {
  const { login, continueDemo } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const nextErrors = validateAuth({ identifier, password, mode: 'login' });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      setLoading(true);
      await login({ identifier, password });
    } catch (error) {
      Alert.alert('Login failed', apiMessage(error, 'Check your credentials and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <View style={styles.hero}>
        <SnapLogo />
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in with email, mobile number, or username.</Text>
      </View>

      <View style={styles.form}>
        <AppInput
          icon="at-sign"
          label="Email, mobile, or username"
          placeholder="aarya@example.com"
          value={identifier}
          onChangeText={setIdentifier}
          error={errors.identifier}
        />
        <AppInput
          icon="lock"
          label="Password"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={errors.password}
        />
        <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgot}>Forgot password?</Text>
        </Pressable>
        <AppButton label="Log in" loading={loading} onPress={submit} icon={<Feather name="arrow-right" color={colors.card} size={18} />} />
        <AppButton label="Preview demo app" variant="ghost" onPress={continueDemo} icon={<Feather name="play-circle" color={colors.ink} size={18} />} />
      </View>

      <Pressable style={styles.bottom} onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.bottomText}>New here? <Text style={styles.link}>Create account</Text></Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.paper,
    flex: 1,
    padding: 22,
  },
  hero: {
    marginTop: 70,
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 38,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 23,
    marginTop: 8,
  },
  form: {
    gap: 16,
    marginTop: 34,
  },
  forgot: {
    alignSelf: 'flex-end',
    color: colors.mintDark,
    fontSize: 13,
    fontWeight: '900',
  },
  bottom: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: 18,
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
