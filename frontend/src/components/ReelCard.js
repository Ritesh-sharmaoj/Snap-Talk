import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import Avatar from './Avatar';

const { height } = Dimensions.get('window');

export default function ReelCard({ reel, onProfile }) {
  const [liked, setLiked] = useState(false);
  const likes = (reel.likesCount || 0) + (liked ? 1 : 0);
  const player = useVideoPlayer(reel.videoUrl, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.play();
  });

  return (
    <View style={[styles.card, { height: height - 90 }]}>
      <VideoView player={player} style={StyleSheet.absoluteFillObject} contentFit="cover" nativeControls={false} />
      <LinearGradient colors={['rgba(16,23,34,0.05)', 'rgba(16,23,34,0.86)']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.actions}>
        <Pressable style={styles.action} onPress={() => setLiked((value) => !value)}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={30} color={liked ? colors.coral : colors.card} />
          <Text style={styles.actionText}>{likes}</Text>
        </Pressable>
        <View style={styles.action}>
          <Ionicons name="chatbubble-outline" size={28} color={colors.card} />
          <Text style={styles.actionText}>{reel.commentCount}</Text>
        </View>
        <View style={styles.action}>
          <Feather name="send" size={26} color={colors.card} />
          <Text style={styles.actionText}>{reel.sharesCount}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Pressable style={styles.user} onPress={() => onProfile?.(reel.author)}>
          <Avatar user={reel.author} size={42} />
          <Text style={styles.username}>@{reel.author.username}</Text>
        </Pressable>
        <Text style={styles.caption}>{reel.caption}</Text>
        <View style={styles.audio}>
          <Feather name="music" size={15} color={colors.card} />
          <Text style={styles.audioText}>{reel.audioTitle}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.ink,
    justifyContent: 'flex-end',
    width: '100%',
  },
  actions: {
    alignItems: 'center',
    bottom: 112,
    gap: 22,
    position: 'absolute',
    right: 16,
  },
  action: {
    alignItems: 'center',
  },
  actionText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 5,
  },
  footer: {
    padding: 18,
    paddingRight: 86,
  },
  user: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  username: {
    color: colors.card,
    fontSize: 15,
    fontWeight: '900',
  },
  caption: {
    color: colors.card,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: 12,
  },
  audio: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  audioText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '800',
  },
});
