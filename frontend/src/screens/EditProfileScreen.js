import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import ScreenHeader from '../components/ScreenHeader';

export default function EditProfileScreen({ navigation }) {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    fullName: user.fullName || '',
    username: user.username || '',
    bio: user.bio || '',
    website: user.website || '',
    avatar: user.avatar || '',
  });
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    try {
      setLoading(true);
      await updateProfile(form);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Could not update profile', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Edit profile" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppInput label="Avatar URL" icon="image" value={form.avatar} onChangeText={(value) => update('avatar', value)} />
        <AppInput label="Full name" icon="user" value={form.fullName} onChangeText={(value) => update('fullName', value)} />
        <AppInput label="Username" icon="at-sign" value={form.username} onChangeText={(value) => update('username', value)} />
        <AppInput label="Bio" icon="edit-3" value={form.bio} onChangeText={(value) => update('bio', value)} multiline />
        <AppInput label="Website" icon="link" value={form.website} onChangeText={(value) => update('website', value)} />
        <AppButton label="Save changes" loading={loading} onPress={save} icon={<Feather name="check" size={18} color={colors.card} />} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.paper,
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 16,
    paddingBottom: 28,
  },
});
