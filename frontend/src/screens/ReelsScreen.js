import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { mockReels } from '../data/mockData';
import ReelCard from '../components/ReelCard';
import ScreenHeader from '../components/ScreenHeader';

export default function ReelsScreen() {
  const { isDemo } = useAuth();
  const [reels, setReels] = useState(mockReels);

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

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Reels" subtitle="Swipe vertical shorts" />
      <FlatList
        data={reels}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ReelCard reel={item} />}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
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
