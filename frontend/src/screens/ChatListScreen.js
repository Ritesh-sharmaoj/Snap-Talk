import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { mockChats } from '../data/mockData';
import { timeAgo } from '../utils/timeAgo';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import ScreenHeader from '../components/ScreenHeader';

export default function ChatListScreen({ navigation }) {
  const { isDemo, user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?._id && !isDemo) return;
    try {
      setLoading(true);
      if (isDemo) {
        setChats(mockChats);
        return;
      }

      const response = await api.get('/messages/conversations');
      const conversations = response.data.data.map((message) => {
        const other = message.sender?._id === user?._id ? message.recipient : message.sender;
        return {
          _id: message.conversationId,
          user: other || {},
          lastMessage: message.text || '📷 Image',
          unread: message.recipient?._id === user?._id && !message.seen ? 1 : 0,
          createdAt: message.createdAt,
        };
      });
      setChats(conversations);
    } catch (_error) {
      setChats(mockChats);
    } finally {
      setLoading(false);
    }
  }, [isDemo, user?._id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user?._id) return undefined;

    const updateConversation = (message) => {
      setChats((current) => {
        const other = message.sender?._id === user._id ? message.recipient : message.sender;
        
        const updatedChat = {
          _id: message.conversationId,
          user: other || {},
          lastMessage: message.text || '📷 Image',
          unread: message.recipient?._id === user._id && !message.seen ? 1 : 0,
          createdAt: message.createdAt,
        };

        const filtered = current.filter((c) => c._id !== message.conversationId);
        return [updatedChat, ...filtered];
      });
    };

    const onSeen = ({ conversationId }) => {
      setChats((current) =>
        current.map((c) => (c._id === conversationId ? { ...c, unread: 0 } : c))
      );
    };

    const onPresence = ({ userId, online }) => {
      setChats((current) =>
        current.map((c) => (c.user?._id === userId ? { ...c, user: { ...c.user, online } } : c))
      );
    };

    socket.on('message:new', updateConversation);
    socket.on('message:sent', updateConversation);
    socket.on('message:seen', onSeen);
    socket.on('presence:update', onPresence);

    return () => {
      socket.off('message:new', updateConversation);
      socket.off('message:sent', updateConversation);
      socket.off('message:seen', onSeen);
      socket.off('presence:update', onPresence);
    };
  }, [user?._id]);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Messages" subtitle="Real-time direct chat" onBack={() => navigation.goBack()} />
      {loading && chats.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.mintDark} />
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="message-circle" title="No chats yet" text="Start a conversation from a profile or shared post." />}
          onRefresh={load}
          refreshing={loading}
          renderItem={({ item }) => (
            <Pressable style={styles.chat} onPress={() => navigation.navigate('Chat', { chat: item })}>
              <Avatar user={item.user} size={54} showStatus />
              <View style={styles.copy}>
                <View style={styles.topRow}>
                  <Text numberOfLines={1} style={styles.name}>
                    {item.user?.fullName || 'User'}
                  </Text>
                  <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
                </View>
                <Text numberOfLines={1} style={styles.message}>
                  {item.lastMessage}
                </Text>
              </View>
              {item.unread ? (
                <View style={styles.unread}>
                  <Text style={styles.unreadText}>{item.unread}</Text>
                </View>
              ) : null}
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
  chat: {
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
  copy: {
    flex: 1,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  name: {
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
  },
  time: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  message: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  unread: {
    alignItems: 'center',
    backgroundColor: colors.coral,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  unreadText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '900',
  },
});
