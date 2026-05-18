import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import AppButton from '../components/AppButton';
import ScreenHeader from '../components/ScreenHeader';

const SettingRow = ({ icon, title, subtitle, right, onPress }) => (
  <Pressable style={styles.row} onPress={onPress}>
    <View style={styles.rowIcon}>
      <Feather name={icon} size={18} color={colors.ink} />
    </View>
    <View style={styles.rowCopy}>
      <Text style={styles.rowTitle}>{title}</Text>
      {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
    </View>
    {right || <Feather name="chevron-right" size={20} color={colors.muted} />}
  </Pressable>
);

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [privateAccount, setPrivateAccount] = useState(Boolean(user.isPrivate));
  const [pushReady, setPushReady] = useState(true);

  const confirmDelete = () => {
    Alert.alert('Delete account', 'This calls DELETE /api/users/me on a connected backend.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout demo', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.section}>Account</Text>
        <SettingRow icon="user" title="Account settings" subtitle="Email, mobile, profile status" />
        <SettingRow icon="lock" title="Change password" subtitle="Update password securely" />
        <Text style={styles.section}>Privacy</Text>
        <SettingRow
          icon="shield"
          title="Private account"
          subtitle="Approve followers before they see posts"
          right={<Switch value={privateAccount} onValueChange={setPrivateAccount} trackColor={{ true: colors.mint, false: colors.line }} />}
        />
        <SettingRow
          icon="bell"
          title="Push notification-ready"
          subtitle="Structure is ready for Expo/Firebase push tokens"
          right={<Switch value={pushReady} onValueChange={setPushReady} trackColor={{ true: colors.mint, false: colors.line }} />}
        />
        {user.role === 'admin' ? (
          <>
            <Text style={styles.section}>Admin</Text>
            <SettingRow icon="grid" title="Admin dashboard" subtitle="Users, reports, moderation" onPress={() => navigation.navigate('AdminDashboard')} />
          </>
        ) : null}
        <View style={styles.buttons}>
          <AppButton label="Logout" variant="ghost" onPress={logout} icon={<Feather name="log-out" size={17} color={colors.ink} />} />
          <AppButton label="Delete account" variant="danger" onPress={confirmDelete} icon={<Feather name="trash-2" size={17} color={colors.card} />} />
        </View>
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
    padding: 16,
  },
  section: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    padding: 13,
  },
  rowIcon: {
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderRadius: 16,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  rowSubtitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  buttons: {
    gap: 12,
    marginTop: 24,
  },
});
