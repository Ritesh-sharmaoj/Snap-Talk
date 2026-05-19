import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { mockReels } from '../data/mockData';
import CommentSheet from '../components/CommentSheet';
import ReelCard from '../components/ReelCard';
import ScreenHeader from '../components/ScreenHeader';

export default function ReelsScreen() {
  const { isDemo } = useAuth();
  const [reels, setReels] = useState(mockReels);
  const [commentTarget, setCommentTarget] = useState(null);

  const load = useCallback(async () => {
    if (isDemo) return;

    try {
      const response = await api.get('/reels');
      setReels(response.data.data.length ? response.data.data : mockReels);
    } catch (_error) {
      setReels(mockReels);
    }
  }, [isDemo]);

  useEffect(() => {
    load();
  }, [load]);

  const likeReel = async (reel) => {
    if (isDemo) return null;
    const response = await api.post(`/likes/reels/${reel._id}`);
    return response.data.data;
  };

  const shareReel = async (reel) => {
    if (isDemo) return null;
    const response = await api.post(`/reels/${reel._id}/share`);
    return response.data.data;
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Reels" subtitle="Swipe vertical shorts" />
      <FlatList
        data={reels}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ReelCard reel={item} onComment={setCommentTarget} onLike={likeReel} onShare={shareReel} />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
      />
      <CommentSheet
        visible={Boolean(commentTarget)}
        targetType="Reel"
        targetId={commentTarget?._id}
        isDemo={isDemo}
        onClose={() => setCommentTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.ink,
    flex: 1,
  },
});
