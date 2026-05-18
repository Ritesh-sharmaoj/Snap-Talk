import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import Avatar from '../components/Avatar';
import ScreenHeader from '../components/ScreenHeader';

export default function ProfileSetupScreen() {
  const { user, setupProfile } = useAuth();
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [loading, setLoading] = useState(false);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const submit = async () => {
    if (!fullName.trim()) {
      Alert.alert('Full name required', 'Add your name before continuing.');
      return;
    }

    try {
      setLoading(true);
      await setupProfile({ avatar, fullName, bio, website });
    } catch (error) {
      Alert.alert('Profile setup failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Profile setup" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Make it yours</Text>
        <Text style={styles.subtitle}>Add a picture, bio, and website so people know who they are following.</Text>
        <Pressable style={styles.avatarPicker} onPress={pickAvatar}>
          {avatar ? <Image source={{ uri: avatar }} style={styles.avatarImage} /> : <Avatar user={user} size={96} ring />}
          <View style={styles.camera}>
            <Feather name="camera" size={17} color={colors.card} />
          </View>
        </Pressable>
        <View style={styles.form}>
          <AppInput label="Full name" icon="user" value={fullName} onChangeText={setFullName} />
          <AppInput label="Bio" icon="edit-3" value={bio} onChangeText={setBio} multiline placeholder="What should people know?" />
          <AppInput label="Website" icon="link" value={website} onChangeText={setWebsite} placeholder="https://your.site" />
          <AppButton label="Enter Snap Talk" loading={loading} onPress={submit} icon={<Feather name="check" size={18} color={colors.card} />} />
        </View>
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
    padding: 22,
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
  avatarPicker: {
    alignSelf: 'center',
    marginVertical: 30,
  },
  avatarImage: {
    borderColor: colors.card,
    borderRadius: 52,
    borderWidth: 4,
    height: 104,
    width: 104,
  },
  camera: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 18,
    bottom: 2,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 2,
    width: 36,
  },
  form: {
    gap: 16,
  },
});
