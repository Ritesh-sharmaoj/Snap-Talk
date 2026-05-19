import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { mockPosts, mockStories } from '../data/mockData';
import EmptyState from '../components/EmptyState';
import IconButton from '../components/IconButton';
import CommentSheet from '../components/CommentSheet';
import PostCard from '../components/PostCard';
import SnapLogo from '../components/SnapLogo';
import StoryBubble from '../components/StoryBubble';

export default function HomeFeedScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isDemo } = useAuth();
  const [posts, setPosts] = useState(isDemo ? mockPosts : []);
  const [stories, setStories] = useState(isDemo ? mockStories : []);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [commentTarget, setCommentTarget] = useState(null);

  const load = useCallback(async () => {
    try {
      const [storyRes, postRes, notifRes] = await Promise.all([
        api.get('/stories'),
        api.get('/posts/feed'),
        api.get('/notifications'),
      ]);
      setStories(storyRes.data.data);
      setPosts(postRes.data.data);
      setUnreadCount(notifRes.data.data.unreadCount);
    } catch (_error) {
      if (!isDemo) {
        setStories([]);
        setPosts([]);
      }
    }
  }, [isDemo]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const onNewNotification = () => {
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification:new', onNewNotification);
    return () => socket.off('notification:new', onNewNotification);
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const likePost = async (post) => {
    const response = await api.post(`/likes/posts/${post._id}`);
    return response.data.data;
  };

  const savePost = async (post) => {
    const response = await api.post(`/posts/${post._id}/save`);
    return response.data.data;
  };

  const sharePost = async (post) => {
    const response = await api.post(`/posts/${post._id}/share`);
    Alert.alert('Share tracked', 'Post share count update ho gaya.');
    return response.data.data;
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <SnapLogo />
        <View style={styles.headerActions}>
          <IconButton
            name="bell"
            onPress={() => navigation.navigate('Notifications')}
            badge={unreadCount > 0 ? unreadCount : null}
          />
          <IconButton name="message-circle" onPress={() => navigation.navigate('ChatList')} />
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.mintDark} />}
        showsVerticalScrollIndicator={false}
      >
        <FlatList
          data={stories}
          horizontal
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <StoryBubble story={item} onPress={() => navigation.navigate('StoryViewer', { story: item })} />}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stories}
        />
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Fresh feed</Text>
          <Text style={styles.sectionMeta}>{posts.length} updates</Text>
        </View>
        {posts.length ? (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onComment={() => setCommentTarget(post)}
              onLike={likePost}
              onSave={savePost}
              onShare={sharePost}
              onProfile={(author) => navigation.navigate('Profile', { username: author.username })}
            />
          ))
        ) : (
          <EmptyState icon="image" title="Your feed is waiting" text="Follow people or publish a post to fill this space." />
        )}
      </ScrollView>
      <CommentSheet
        visible={Boolean(commentTarget)}
        targetType="Post"
        targetId={commentTarget?._id}
        isDemo={isDemo}
        onClose={() => setCommentTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.paper,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  stories: {
    paddingBottom: 18,
    paddingTop: 8,
  },
  sectionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  sectionMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
});
