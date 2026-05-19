import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { mockPosts } from '../data/mockData';
import AppButton from '../components/AppButton';
import Avatar from '../components/Avatar';
import IconButton from '../components/IconButton';

const Stat = ({ label, value, onPress }) => (
  <Pressable style={styles.stat} onPress={onPress} disabled={!onPress}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Pressable>
);

export default function ProfileScreen({ navigation, route }) {
  const { isDemo, user: currentUser } = useAuth();
  const usernameParam = route.params?.username;
  const isOwnProfile = !usernameParam || usernameParam === currentUser.username;
  const [profile, setProfile] = useState(isOwnProfile ? currentUser : null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('grid');
  const [following, setFollowing] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const target = usernameParam || currentUser.username;
        const [profileRes, postsRes] = await Promise.all([
          api.get(`/users/${target}`),
          activeTab === 'saved' && isOwnProfile ? api.get('/users/me/saved-posts') : api.get(`/users/${target}/posts`),
        ]);
        setProfile(profileRes.data.data);
        setPosts(postsRes.data.data);
        setFollowing(profileRes.data.data.isFollowing);
      } catch (_error) {
        if (isDemo && isOwnProfile) {
          setProfile(currentUser);
          setPosts(mockPosts);
        } else if (isOwnProfile) {
          setProfile(currentUser);
          setPosts([]);
        } else {
          setPosts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isDemo, currentUser, usernameParam, isOwnProfile, activeTab]);

  const toggleFollow = async () => {
    if (isDemo || isOwnProfile) return;

    try {
      setLoadingAction(true);
      if (following) {
        await api.delete(`/follow/${profile._id}`);
        setFollowing(false);
      } else {
        await api.post(`/follow/${profile._id}`);
        setFollowing(true);
      }
    } catch (error) {
      Alert.alert('Action failed', error.response?.data?.message || 'Try again later.');
    } finally {
      setLoadingAction(false);
    }
  };

  const blockUser = async () => {
    Alert.alert('Block user?', `You won't be able to see each other's posts or profiles.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoadingAction(true);
            await api.post(`/users/${profile._id}/block`);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Block failed', error.response?.data?.message || 'Try again later.');
          } finally {
            setLoadingAction(false);
          }
        },
      },
    ]);
  };

  if (loading && !profile) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.statLabel}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <Text style={styles.username}>@{profile.username}</Text>
          {isOwnProfile ? (
            <IconButton name="settings" onPress={() => navigation.navigate('Settings')} />
          ) : (
            <IconButton name="more-vertical" onPress={() => blockUser()} />
          )}
        </View>
        <View style={styles.profileRow}>
          <Avatar user={profile} size={92} ring />
          <View style={styles.stats}>
            <Stat label="Posts" value={profile.postsCount} />
            <Stat
              label="Followers"
              value={profile.followersCount}
              onPress={() => navigation.push('UserList', { title: 'Followers', username: profile.username, type: 'followers' })}
            />
            <Stat
              label="Following"
              value={profile.followingCount}
              onPress={() => navigation.push('UserList', { title: 'Following', username: profile.username, type: 'following' })}
            />
          </View>
        </View>
        <Text style={styles.name}>{profile.fullName}</Text>
        <Text style={styles.bio}>{profile.bio || 'Snap Talk creator.'}</Text>
        {profile.website ? <Text style={styles.website}>{profile.website}</Text> : null}
        <View style={styles.actions}>
          {isOwnProfile ? (
            <AppButton label="Edit profile" variant="ghost" onPress={() => navigation.navigate('EditProfile')} icon={<Feather name="edit-3" size={17} color={colors.ink} />} style={styles.actionButton} />
          ) : (
            <AppButton
              label={following ? 'Following' : 'Follow'}
              variant={following ? 'ghost' : 'primary'}
              loading={loadingAction}
              onPress={toggleFollow}
              style={styles.actionButton}
            />
          )}
          <AppButton
            label="Share"
            variant="ghost"
            onPress={() => Alert.alert('Profile link', `snaptalk://profile/${profile.username}`)}
            icon={<Feather name="send" size={17} color={colors.ink} />}
            style={styles.actionButton}
          />
        </View>
        <View style={styles.tabs}>
          <Pressable onPress={() => setActiveTab('grid')}>
            <Feather name="grid" size={20} color={activeTab === 'grid' ? colors.ink : colors.muted} />
          </Pressable>
          <Feather name="play-circle" size={20} color={colors.muted} />
          {isOwnProfile && (
            <Pressable onPress={() => setActiveTab('saved')}>
              <Feather name="bookmark" size={20} color={activeTab === 'saved' ? colors.ink : colors.muted} />
            </Pressable>
          )}
        </View>
        <View style={styles.grid}>
          {posts.map((post) => (
            <Pressable key={post._id} style={styles.tile} onPress={() => navigation.navigate('PostDetail', { post })}>
              <Image source={{ uri: post.mediaUrl }} style={styles.image} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  screen: {
    backgroundColor: colors.paper,
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
    paddingTop: 62,
  },
  top: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  username: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
  },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 20,
    marginTop: 20,
  },
  stats: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },
  name: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 18,
  },
  bio: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  website: {
    color: colors.mintDark,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  actionButton: {
    flex: 1,
  },
  tabs: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 12,
  },
  tile: {
    aspectRatio: 1,
    backgroundColor: colors.line,
    borderRadius: 12,
    overflow: 'hidden',
    width: '32%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
