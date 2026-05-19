import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { mockNotifications } from '../data/mockData';
import { timeAgo } from '../utils/timeAgo';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import ScreenHeader from '../components/ScreenHeader';

const iconFor = {
  like: 'heart',
  comment: 'message-circle',
  follow: 'user-plus',
  message: 'send',
  system: 'bell',
};

export default function NotificationsScreen({ navigation }) {
  const { isDemo } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      if (isDemo) {
        setItems(mockNotifications);
        return;
      }

      const response = await api.get('/notifications');
      setItems(response.data.data.notifications);
    } catch (_error) {
      setItems(mockNotifications);
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const onNewNotification = (notification) => {
      setItems((current) => [notification, ...current]);
    };

    socket.on('notification:new', onNewNotification);
    return () => socket.off('notification:new', onNewNotification);
  }, []);

  const markRead = async (item) => {
    if (item.read) return;

    setItems((current) =>
      current.map((notification) => (notification._id === item._id ? { ...notification, read: true } : notification))
    );

    if (!isDemo) {
      await api.patch(`/notifications/${item._id}/read`).catch(() => {});
    }
  };

  const handlePress = (item) => {
    markRead(item);

    if (item.entityType === 'Post' || item.entityType === 'Comment') {
      navigation.navigate('PostDetail', { postId: item.entity });
    } else if (item.entityType === 'User') {
      navigation.navigate('Profile', { username: item.actor?.username });
    } else if (item.entityType === 'Message') {
      navigation.navigate('Chat', { chat: { user: item.actor } });
    }
  };

  const markAllRead = async () => {
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    if (!isDemo) {
      await api.patch('/notifications/read-all').catch(() => {});
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Notifications"
        onBack={() => navigation.goBack()}
        rightIcon={items.some((i) => !i.read) ? 'check-circle' : null}
        onRightPress={markAllRead}
      />
      {loading && items.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.mintDark} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          onRefresh={load}
          refreshing={loading}
          ListEmptyComponent={<EmptyState icon="bell" title="No notifications" text="Likes, comments, follows, and messages will appear here." />}
          renderItem={({ item }) => (
            <Pressable style={[styles.item, !item.read && styles.unread]} onPress={() => handlePress(item)}>
              <Avatar user={item.actor} size={48} />
              <View style={styles.copy}>
                <Text style={styles.text}>
                  <Text style={styles.bold}>{item.actor?.username || 'Snap Talk'}</Text> {item.text}
                </Text>
                <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
              </View>
              <View style={styles.rightContent}>
                {!item.read && <View style={styles.unreadDot} />}
                <View style={styles.icon}>
                  <Feather name={iconFor[item.type] || 'bell'} size={17} color={colors.mintDark} />
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.paper,
    flex: 1,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  list: {
    padding: 16,
  },
  item: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    padding: 12,
  },
  unread: {
    borderColor: colors.mint,
  },
  copy: {
    flex: 1,
  },
  text: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  bold: {
    color: colors.ink,
    fontWeight: '900',
  },
  time: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: '#E6FBF5',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  rightContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  unreadDot: {
    backgroundColor: colors.coral,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
});
