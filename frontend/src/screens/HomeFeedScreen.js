import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { mockPosts, mockStories } from '../data/mockData';
import EmptyState from '../components/EmptyState';
import IconButton from '../components/IconButton';
import PostCard from '../components/PostCard';
import SnapLogo from '../components/SnapLogo';
import StoryBubble from '../components/StoryBubble';

export default function HomeFeedScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isDemo } = useAuth();
  const [posts, setPosts] = useState(mockPosts);
  const [stories, setStories] = useState(mockStories);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (isDemo) return;

    try {
      const [storyRes, postRes] = await Promise.all([api.get('/stories'), api.get('/posts/feed')]);
      setStories(storyRes.data.data.length ? storyRes.data.data : mockStories);
      setPosts(postRes.data.data.length ? postRes.data.data : mockPosts);
    } catch (_error) {
      setStories(mockStories);
      setPosts(mockPosts);
    }
  }, [isDemo]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <SnapLogo />
        <View style={styles.headerActions}>
          <IconButton name="bell" onPress={() => navigation.navigate('Notifications')} />
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
              onComment={() => Alert.alert('Comments', 'Comment sheet is API-ready. Use /api/comments/Post/:postId.')}
              onShare={() => Alert.alert('Share', 'Share count is tracked through /api/posts/:postId/share.')}
            />
          ))
        ) : (
          <EmptyState icon="image" title="Your feed is waiting" text="Follow people or publish a post to fill this space." />
        )}
      </ScrollView>
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
