import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { mockReels } from '../data/mockData';
import CommentSheet from '../components/CommentSheet';
import ReelCard from '../components/ReelCard';
import ScreenHeader from '../components/ScreenHeader';

export default function ReelsScreen({ navigation }) {
  const { isDemo } = useAuth();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentTarget, setCommentTarget] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (isDemo) {
        setReels(mockReels);
        setLoading(false);
        return;
      }

      const response = await api.get('/reels');
      setReels(response.data.data.length ? response.data.data : mockReels);
    } catch (_err) {
      setError('Reels load nahi ho paayi. Dobara koshish karein.');
      if (reels.length === 0) {
        setReels(mockReels);
      }
    } finally {
      setLoading(false);
    }
  }, [isDemo, reels.length]);

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

  const deleteReel = async (reel) => {
    if (isDemo) {
      setReels((current) => current.filter((r) => r._id !== reel._id));
      return;
    }
    await api.delete(`/reels/${reel._id}`);
    setReels((current) => current.filter((r) => r._id !== reel._id));
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Reels" subtitle="Swipe vertical shorts" />
      
      {loading && reels.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.mintDark} />
        </View>
      ) : error && reels.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={reels}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ReelCard
              reel={item}
              onComment={setCommentTarget}
              onLike={likeReel}
              onShare={shareReel}
              onDelete={deleteReel}
              onProfile={(author) => navigation.navigate('Profile', { username: author.username })}
            />
          )}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToAlignment="start"
          decelerationRate="fast"
          onRefresh={load}
          refreshing={loading}
        />
      )}

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
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    color: colors.card,
    fontSize: 14,
    textAlign: 'center',
  },
});
