import React, { useEffect, useState } from 'react';
import { Alert, FlatList, ImageBackground, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { api, apiMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/timeAgo';
import Avatar from '../components/Avatar';
import IconButton from '../components/IconButton';
import UserRow from '../components/UserRow';

export default function StoryViewerScreen({ navigation, route }) {
  const { story: initialStory } = route.params;
  const { user, isDemo } = useAuth();
  const [story, setStory] = useState(initialStory);
  const [viewers, setViewers] = useState([]);
  const [viewersVisible, setViewersVisible] = useState(false);
  const [loadingViewers, setLoadingViewers] = useState(false);

  const isOwner = story.author._id === user?._id || story.author === user?._id;

  useEffect(() => {
    const markViewed = async () => {
      if (!isDemo && story?._id) {
        try {
          const response = await api.get(`/stories/${story._id}`);
          setStory(response.data.data);
        } catch (_err) {
          // Keep initial story if fetch fails
        }
      }
    };
    markViewed();
  }, [isDemo, story?._id]);

  const loadViewers = async () => {
    if (isDemo || !isOwner) return;
    try {
      setLoadingViewers(true);
      const response = await api.get(`/stories/${story._id}/viewers`);
      setViewers(response.data.data);
      setViewersVisible(true);
    } catch (err) {
      Alert.alert('Error', apiMessage(err, 'Viewers load nahi ho paaye.'));
    } finally {
      setLoadingViewers(false);
    }
  };

  const deleteStory = async () => {
    Alert.alert('Delete Story', 'Are you sure you want to delete this story?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (isDemo) {
            navigation.goBack();
            return;
          }
          try {
            await api.delete(`/stories/${story._id}`);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', apiMessage(err, 'Story delete nahi ho paayi.'));
          }
        },
      },
    ]);
  };

  return (
    <ImageBackground source={{ uri: story.mediaUrl }} style={styles.screen}>
      <LinearGradient colors={['rgba(16,23,34,0.65)', 'transparent', 'rgba(16,23,34,0.82)']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.header}>
        <Avatar user={story.author} size={44} ring />
        <View style={styles.copy}>
          <Text style={styles.name}>{story.author.fullName}</Text>
          <Text style={styles.time}>{timeAgo(story.createdAt)}</Text>
        </View>
        <View style={styles.headerActions}>
          {isOwner && <IconButton name="trash-2" onPress={deleteStory} bg="rgba(255,255,255,0.18)" color={colors.card} />}
          <IconButton name="x" onPress={() => navigation.goBack()} bg="rgba(255,255,255,0.18)" color={colors.card} />
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.caption}>{story.caption}</Text>
        {isOwner ? (
          <Pressable style={styles.viewersBtn} onPress={loadViewers}>
            <Feather name="eye" size={16} color="#DDE7E4" />
            <Text style={styles.viewers}>{story.viewers?.length || 0} viewers</Text>
          </Pressable>
        ) : (
          <Text style={styles.viewers}>{story.viewers?.length || 0} viewers</Text>
        )}
      </View>

      <Modal visible={viewersVisible} animationType="slide" transparent onRequestClose={() => setViewersVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Story Viewers</Text>
              <IconButton name="x" onPress={() => setViewersVisible(false)} />
            </View>
            <FlatList
              data={viewers}
              keyExtractor={(item) => item.user._id}
              contentContainerStyle={styles.viewersList}
              renderItem={({ item }) => (
                <View style={styles.viewerRow}>
                  <UserRow
                    user={item.user}
                    onPress={() => {
                      setViewersVisible(false);
                      navigation.navigate('Profile', { username: item.user.username });
                    }}
                  />
                  <Text style={styles.viewedTime}>{timeAgo(item.viewedAt)}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyViewers}>No views yet.</Text>}
            />
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.ink,
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    padding: 18,
    paddingTop: 60,
  },
  copy: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  name: {
    color: colors.card,
    fontSize: 15,
    fontWeight: '900',
  },
  time: {
    color: '#DDE7E4',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  footer: {
    padding: 22,
    paddingBottom: 44,
  },
  caption: {
    color: colors.card,
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 29,
  },
  viewersBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  viewers: {
    color: '#DDE7E4',
    fontSize: 13,
    fontWeight: '800',
  },
  modalBackdrop: {
    backgroundColor: 'rgba(16,23,34,0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    minHeight: '40%',
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  modalTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  viewersList: {
    padding: 16,
  },
  viewerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewedTime: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyViewers: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 40,
    textAlign: 'center',
  },
});
