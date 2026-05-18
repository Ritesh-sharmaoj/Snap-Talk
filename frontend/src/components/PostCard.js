import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { timeAgo } from '../utils/timeAgo';
import Avatar from './Avatar';
import IconButton from './IconButton';

export default function PostCard({ post, onComment, onProfile, onShare }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const likes = (post.likesCount || post.likes?.length || 0) + (liked ? 1 : 0);

  return (
    <View style={styles.card}>
      <Pressable style={styles.header} onPress={() => onProfile?.(post.author)}>
        <Avatar user={post.author} size={44} />
        <View style={styles.identity}>
          <Text style={styles.name}>{post.author.fullName}</Text>
          <Text style={styles.meta}>
            @{post.author.username} · {timeAgo(post.createdAt)}
          </Text>
        </View>
        <IconButton name="more-horizontal" size={38} />
      </Pressable>

      <View style={styles.mediaWrap}>
        <Image source={{ uri: post.mediaUrl }} style={styles.media} />
        {post.mediaType === 'video' ? (
          <View style={styles.play}>
            <Ionicons name="play" size={26} color={colors.card} />
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable onPress={() => setLiked((value) => !value)} style={styles.action}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={25} color={liked ? colors.coral : colors.ink} />
          <Text style={styles.actionText}>{likes}</Text>
        </Pressable>
        <Pressable onPress={onComment} style={styles.action}>
          <Ionicons name="chatbubble-outline" size={23} color={colors.ink} />
          <Text style={styles.actionText}>{post.commentCount || 0}</Text>
        </Pressable>
        <Pressable onPress={onShare} style={styles.action}>
          <Feather name="send" size={22} color={colors.ink} />
          <Text style={styles.actionText}>{post.sharesCount || 0}</Text>
        </Pressable>
        <Pressable onPress={() => setSaved((value) => !value)} style={[styles.action, styles.save]}>
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={25} color={saved ? colors.mintDark : colors.ink} />
        </Pressable>
      </View>

      <Text style={styles.caption}>
        <Text style={styles.captionUser}>{post.author.username}</Text> {post.caption}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 18,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  identity: {
    flex: 1,
  },
  name: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  mediaWrap: {
    aspectRatio: 0.95,
    backgroundColor: '#DCE8E5',
  },
  media: {
    height: '100%',
    width: '100%',
  },
  play: {
    alignItems: 'center',
    backgroundColor: 'rgba(16,23,34,0.5)',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    left: '50%',
    marginLeft: -26,
    marginTop: -26,
    position: 'absolute',
    top: '50%',
    width: 52,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15,
    paddingHorizontal: 14,
    paddingTop: 13,
  },
  action: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  actionText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  save: {
    marginLeft: 'auto',
  },
  caption: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 21,
    padding: 14,
    paddingTop: 10,
  },
  captionUser: {
    color: colors.ink,
    fontWeight: '900',
  },
});
