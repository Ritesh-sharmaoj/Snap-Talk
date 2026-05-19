import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { api, apiMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { mockPosts } from '../data/mockData';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import ScreenHeader from '../components/ScreenHeader';

export default function CreatePostScreen() {
  const { isDemo } = useAuth();
  const [asset, setAsset] = useState(null);
  const [mode, setMode] = useState('post');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [loading, setLoading] = useState(false);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.9,
      videoMaxDuration: 60,
    });

    if (!result.canceled) {
      setAsset(result.assets[0]);
    }
  };

  const uploadAsset = async () => {
    if (!asset || isDemo) {
      return {
        mediaUrl: asset?.uri || mockPosts[0].mediaUrl,
        mediaType: asset?.type || 'image',
      };
    }

    const data = new FormData();
    data.append('media', {
      uri: asset.uri,
      name: asset.fileName || `snap-talk-${Date.now()}.${asset.type === 'video' ? 'mp4' : 'jpg'}`,
      type: asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg'),
    });

    const response = await api.post('/uploads', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return {
      mediaUrl: response.data.data.url,
      mediaType: response.data.data.mediaType,
    };
  };

  const publish = async () => {
    if (!asset && !isDemo) {
      Alert.alert('Choose media', 'Select an image or video before publishing.');
      return;
    }

    try {
      setLoading(true);
      const media = await uploadAsset();
      const tagList = hashtags
        .split(',')
        .map((tag) => tag.trim().replace('#', ''))
        .filter(Boolean);

      if (!isDemo) {
        if (mode === 'story') {
          await api.post('/stories', {
            mediaUrl: media.mediaUrl,
            mediaType: media.mediaType,
            caption,
          });
        } else if (mode === 'reel') {
          if (media.mediaType !== 'video') {
            Alert.alert('Video required', 'Reel publish karne ke liye video select karo.');
            return;
          }

          await api.post('/reels', {
            videoUrl: media.mediaUrl,
            caption,
            hashtags: tagList,
            audioTitle: 'Original audio',
          });
        } else {
          await api.post('/posts', {
            ...media,
            caption,
            hashtags: tagList,
          });
        }
      }

      setAsset(null);
      setCaption('');
      setHashtags('');
      Alert.alert('Published', `Your ${mode} is live on Snap Talk.`);
    } catch (error) {
      Alert.alert('Publish failed', apiMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <ScreenHeader title="Create post" subtitle="Preview before publishing" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.dropzone} onPress={pickMedia}>
          {asset ? (
            <Image source={{ uri: asset.uri }} style={styles.preview} />
          ) : (
            <View style={styles.emptyMedia}>
              <View style={styles.plus}>
                <Feather name="plus" size={28} color={colors.card} />
              </View>
              <Text style={styles.dropTitle}>Upload image or video</Text>
              <Text style={styles.dropText}>Pick media, write a caption, add hashtags, then publish.</Text>
            </View>
          )}
        </Pressable>
        <View style={styles.modes}>
          {['post', 'story', 'reel'].map((item) => (
            <Pressable key={item} style={[styles.mode, mode === item && styles.modeActive]} onPress={() => setMode(item)}>
              <Text style={[styles.modeText, mode === item && styles.modeTextActive]}>{item.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.form}>
          <AppInput label="Caption" icon="edit-3" placeholder="What is happening?" value={caption} onChangeText={setCaption} multiline />
          <AppInput label="Hashtags" icon="hash" placeholder="travel, design, food" value={hashtags} onChangeText={setHashtags} />
          <AppButton label="Publish post" loading={loading} onPress={publish} icon={<Feather name="send" size={18} color={colors.card} />} />
        </View>
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
    padding: 16,
    paddingBottom: 30,
  },
  dropzone: {
    aspectRatio: 0.82,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  preview: {
    height: '100%',
    width: '100%',
  },
  emptyMedia: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  plus: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginBottom: 16,
    width: 56,
  },
  dropTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  dropText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    gap: 16,
    marginTop: 18,
  },
  modes: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  mode: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    height: 42,
    justifyContent: 'center',
  },
  modeActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  modeText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  modeTextActive: {
    color: colors.card,
  },
});
