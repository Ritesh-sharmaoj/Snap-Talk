import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { timeAgo } from '../utils/timeAgo';
import Avatar from '../components/Avatar';
import IconButton from '../components/IconButton';

export default function StoryViewerScreen({ navigation, route }) {
  const { story } = route.params;

  return (
    <ImageBackground source={{ uri: story.mediaUrl }} style={styles.screen}>
      <LinearGradient colors={['rgba(16,23,34,0.65)', 'transparent', 'rgba(16,23,34,0.82)']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.header}>
        <Avatar user={story.author} size={44} ring />
        <View style={styles.copy}>
          <Text style={styles.name}>{story.author.fullName}</Text>
          <Text style={styles.time}>{timeAgo(story.createdAt)}</Text>
        </View>
        <IconButton name="x" onPress={() => navigation.goBack()} bg="rgba(255,255,255,0.18)" color={colors.card} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.caption}>{story.caption}</Text>
        <Text style={styles.viewers}>{story.viewers?.length || 0} viewers</Text>
      </View>
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
  viewers: {
    color: '#DDE7E4',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 10,
  },
});
