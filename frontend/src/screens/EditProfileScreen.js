import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { api, apiMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import ScreenHeader from '../components/ScreenHeader';
import Avatar from '../components/Avatar';

export default function EditProfileScreen({ navigation }) {
  const { user, updateProfile, isDemo } = useAuth();
  const [form, setForm] = useState({
    fullName: user.fullName || '',
    username: user.username || '',
    bio: user.bio || '',
    website: user.website || '',
    avatar: user.avatar || '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const pickImage = async () => {
    if (isDemo) {
      Alert.alert('Demo mode', 'Image upload is disabled in demo mode.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (asset) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('media', {
        uri: asset.uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      });

      const response = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      update('avatar', response.data.data.url);
    } catch (error) {
      Alert.alert('Upload failed', apiMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    try {
      setLoading(true);
      await updateProfile(form);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Update failed', apiMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Edit profile" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <Avatar user={{ ...user, avatar: form.avatar }} size={100} ring />
          <AppButton
            label={uploading ? 'Uploading...' : 'Change profile photo'}
            variant="ghost"
            onPress={pickImage}
            loading={uploading}
            style={styles.avatarBtn}
          />
        </View>
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
  avatarSection: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    marginTop: 10,
  },
  avatarBtn: {
    borderColor: 'transparent',
    height: 40,
  },
});
