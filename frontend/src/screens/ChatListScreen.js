import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { mockChats } from '../data/mockData';
import { timeAgo } from '../utils/timeAgo';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import ScreenHeader from '../components/ScreenHeader';

export default function ChatListScreen({ navigation }) {
  const { isDemo, user } = useAuth();
  const [chats, setChats] = useState(mockChats);

  const load = useCallback(async () => {
    if (isDemo) return;

    try {
      const response = await api.get('/messages/conversations');
      const conversations = response.data.data.map((message) => {
        const other = message.sender._id === user._id ? message.recipient : message.sender;
        return {
          _id: message.conversationId,
          user: other,
          lastMessage: message.text || 'Image message',
          unread: message.recipient._id === user._id && !message.seen ? 1 : 0,
          createdAt: message.createdAt,
        };
      });
      setChats(conversations);
    } catch (_error) {
      setChats(mockChats);
    }
  }, [isDemo, user]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Messages" subtitle="Real-time direct chat" onBack={() => navigation.goBack()} />
      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="message-circle" title="No chats yet" text="Start a conversation from a profile or shared post." />}
        renderItem={({ item }) => (
          <Pressable style={styles.chat} onPress={() => navigation.navigate('Chat', { chat: item })}>
            <View>
              <Avatar user={item.user} size={54} />
              {item.user.online ? <View style={styles.online} /> : null}
            </View>
            <View style={styles.copy}>
              <View style={styles.topRow}>
                <Text numberOfLines={1} style={styles.name}>
                  {item.user.fullName}
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.paper,
    flex: 1,
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
  online: {
    backgroundColor: colors.success,
    borderColor: colors.card,
    borderRadius: 7,
    borderWidth: 2,
    bottom: 1,
    height: 14,
    position: 'absolute',
    right: 2,
    width: 14,
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
