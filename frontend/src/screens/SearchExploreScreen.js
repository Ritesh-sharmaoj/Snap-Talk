import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { mockPosts, mockUsers } from '../data/mockData';
import AppButton from '../components/AppButton';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import UserRow from '../components/UserRow';

export default function SearchExploreScreen() {
  const { isDemo } = useAuth();
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [followed, setFollowed] = useState({});
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingFollow, setLoadingFollow] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        if (query.trim()) {
          const normalized = query.trim().replace('#', '');
          const [userRes, postRes] = await Promise.all([
            api.get(`/users/search?q=${encodeURIComponent(normalized)}`),
            query.trim().startsWith('#') ? api.get(`/posts/hashtag/${normalized}`) : api.get('/posts/explore'),
          ]);
          setUsers(userRes.data.data);
          setPosts(postRes.data.data);
        } else {
          const [userRes, postRes] = await Promise.all([api.get('/users/suggested'), api.get('/posts/explore')]);
          setUsers(userRes.data.data);
          setPosts(postRes.data.data);
        }
      } catch (_error) {
        if (isDemo) {
          const q = query.toLowerCase().replace('#', '');
          setUsers(
            query.trim()
              ? mockUsers.filter((user) => user.username.includes(q) || user.fullName.toLowerCase().includes(q))
              : mockUsers.slice(1)
          );
          setPosts(
            query.trim()
              ? mockPosts.filter((post) => post.caption.toLowerCase().includes(q) || post.hashtags?.includes(q))
              : mockPosts
          );
        } else {
          setUsers([]);
          setPosts([]);
        }
      }
    };

    const timer = setTimeout(load, 350);
    return () => clearTimeout(timer);
  }, [query, isDemo]);

  const toggleFollow = async (user) => {
    const current = Object.prototype.hasOwnProperty.call(followed, user._id) ? followed[user._id] : Boolean(user.isFollowing);
    setFollowed((state) => ({ ...state, [user._id]: !current }));

    if (isDemo) return;

    try {
      setLoadingFollow((state) => ({ ...state, [user._id]: true }));
      if (current) {
        await api.delete(`/follow/${user._id}`);
      } else {
        await api.post(`/follow/${user._id}`);
      }
    } catch (_error) {
      setFollowed((state) => ({ ...state, [user._id]: current }));
    } finally {
      setLoadingFollow((state) => ({ ...state, [user._id]: false }));
    }
  };

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
              onPress={() => navigation.navigate('Profile', { username: user.username })}
              right={
                <AppButton
                  label={(Object.prototype.hasOwnProperty.call(followed, user._id) ? followed[user._id] : user.isFollowing) ? 'Following' : 'Follow'}
                  variant={(Object.prototype.hasOwnProperty.call(followed, user._id) ? followed[user._id] : user.isFollowing) ? 'ghost' : 'primary'}
                  loading={loadingFollow[user._id]}
                  onPress={() => toggleFollow(user)}
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
              <Pressable key={post._id} style={styles.tile} onPress={() => navigation.navigate('PostDetail', { post })}>
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
