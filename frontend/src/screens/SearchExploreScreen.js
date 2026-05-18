import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { mockPosts, mockUsers } from '../data/mockData';
import AppButton from '../components/AppButton';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import UserRow from '../components/UserRow';

export default function SearchExploreScreen() {
  const [query, setQuery] = useState('');
  const [followed, setFollowed] = useState({});

  const users = useMemo(() => {
    if (!query.trim()) return mockUsers.slice(1);
    const q = query.toLowerCase();
    return mockUsers.filter((user) => user.username.includes(q) || user.fullName.toLowerCase().includes(q));
  }, [query]);

  const posts = useMemo(() => {
    if (!query.trim()) return mockPosts;
    const q = query.toLowerCase().replace('#', '');
    return mockPosts.filter((post) => post.caption.toLowerCase().includes(q) || post.hashtags?.includes(q));
  }, [query]);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Explore" subtitle="Find people, hashtags, and trending posts" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search @users or #hashtags" />
        <View style={styles.section}>
          <Text style={styles.title}>{query ? 'Search results' : 'Suggested people'}</Text>
          {users.map((user) => (
            <UserRow
              key={user._id}
              user={user}
              right={
                <AppButton
                  label={followed[user._id] ? 'Following' : 'Follow'}
                  variant={followed[user._id] ? 'ghost' : 'primary'}
                  onPress={() => setFollowed((current) => ({ ...current, [user._id]: !current[user._id] }))}
                  style={styles.follow}
                />
              }
            />
          ))}
        </View>
        <View style={styles.section}>
          <View style={styles.trendHeader}>
            <Text style={styles.title}>Trending now</Text>
            <View style={styles.badge}>
              <Feather name="trending-up" size={14} color={colors.mintDark} />
              <Text style={styles.badgeText}>Live</Text>
            </View>
          </View>
          <View style={styles.grid}>
            {posts.map((post) => (
              <Pressable key={post._id} style={styles.tile}>
                <Image source={{ uri: post.mediaUrl }} style={styles.tileImage} />
              </Pressable>
            ))}
          </View>
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
    padding: 16,
    paddingBottom: 28,
  },
  section: {
    marginTop: 22,
  },
  title: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 10,
  },
  follow: {
    minWidth: 112,
  },
  trendHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    alignItems: 'center',
    backgroundColor: '#E6FBF5',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: colors.mintDark,
    fontSize: 12,
    fontWeight: '900',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    aspectRatio: 1,
    backgroundColor: colors.line,
    borderRadius: 14,
    overflow: 'hidden',
    width: '31.8%',
  },
  tileImage: {
    height: '100%',
    width: '100%',
  },
});
