import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { mockPosts } from '../data/mockData';
import AppButton from '../components/AppButton';
import Avatar from '../components/Avatar';
import IconButton from '../components/IconButton';

const Stat = ({ label, value }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const [posts] = useState(mockPosts);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <Text style={styles.username}>@{user.username}</Text>
          <IconButton name="settings" onPress={() => navigation.navigate('Settings')} />
        </View>
        <View style={styles.profileRow}>
          <Avatar user={user} size={92} ring />
          <View style={styles.stats}>
            <Stat label="Posts" value={user.postsCount || posts.length} />
            <Stat label="Followers" value={user.followersCount || 0} />
            <Stat label="Following" value={user.followingCount || 0} />
          </View>
        </View>
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.bio}>{user.bio || 'Add a bio to tell people what you create.'}</Text>
        {user.website ? <Text style={styles.website}>{user.website}</Text> : null}
        <View style={styles.actions}>
          <AppButton label="Edit profile" variant="ghost" onPress={() => navigation.navigate('EditProfile')} icon={<Feather name="edit-3" size={17} color={colors.ink} />} style={styles.actionButton} />
          <AppButton label="Share profile" variant="ghost" onPress={() => {}} icon={<Feather name="send" size={17} color={colors.ink} />} style={styles.actionButton} />
        </View>
        <View style={styles.tabs}>
          <Feather name="grid" size={20} color={colors.ink} />
          <Feather name="play-circle" size={20} color={colors.muted} />
          <Feather name="bookmark" size={20} color={colors.muted} />
        </View>
        <View style={styles.grid}>
          {posts.map((post) => (
            <Pressable key={post._id} style={styles.tile}>
              <Image source={{ uri: post.mediaUrl }} style={styles.image} />
            </Pressable>
          ))}
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
