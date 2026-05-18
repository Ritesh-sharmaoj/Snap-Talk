import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import ScreenHeader from '../components/ScreenHeader';

export default function ForgotPasswordScreen({ navigation }) {
  const { forgotPassword } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!identifier.trim()) {
      Alert.alert('Missing detail', 'Enter your email, mobile number, or username.');
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPassword(identifier);
      const token = response?.data?.data?.resetToken;
      Alert.alert('Reset started', token ? `Development reset token: ${token}` : 'If the account exists, a reset link will be sent.');
    } catch (error) {
      Alert.alert('Could not start reset', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Forgot password" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.title}>Recover access</Text>
        <Text style={styles.subtitle}>We will generate a secure reset token for your account.</Text>
        <AppInput label="Email, mobile, or username" icon="mail" placeholder="aarya@example.com" value={identifier} onChangeText={setIdentifier} style={styles.input} />
        <AppButton label="Send reset link" loading={loading} onPress={submit} icon={<Feather name="send" size={18} color={colors.card} />} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.paper,
    flex: 1,
  },
  content: {
    padding: 22,
  },
  title: {
    color: colors.ink,
    fontSize: 30,
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
  input: {
    marginBottom: 16,
    marginTop: 28,
  },
});
