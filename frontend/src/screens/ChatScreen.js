import React, { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { mockMessages } from '../data/mockData';
import ChatBubble from '../components/ChatBubble';
import ScreenHeader from '../components/ScreenHeader';

export default function ChatScreen({ navigation, route }) {
  const { chat } = route.params;
  const { user, isDemo } = useAuth();
  const [messages, setMessages] = useState(mockMessages);
  const [text, setText] = useState('');

  useEffect(() => {
    const load = async () => {
      if (isDemo) return;

      try {
        const response = await api.get(`/messages/${chat.user._id}`);
        setMessages(response.data.data);
        await api.patch(`/messages/${chat.user._id}/seen`);
      } catch (_error) {
        setMessages(mockMessages);
      }
    };

    load();
  }, [chat.user._id, isDemo]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const onMessage = (message) => {
      if (message.sender._id === chat.user._id || message.recipient._id === chat.user._id) {
        setMessages((current) => [...current, message]);
      }
    };

    socket.on('message:new', onMessage);
    return () => socket.off('message:new', onMessage);
  }, [chat.user._id]);

  const send = async () => {
    const value = text.trim();
    if (!value) return;

    const optimistic = {
      _id: `local-${Date.now()}`,
      sender: user,
      recipient: chat.user,
      text: value,
      type: 'text',
      createdAt: new Date().toISOString(),
      seen: false,
    };
    setMessages((current) => [...current, optimistic]);
    setText('');

    if (isDemo) return;

    try {
      await api.post('/messages', { recipientId: chat.user._id, text: value, type: 'text' });
    } catch (_error) {
      setMessages((current) => current.filter((message) => message._id !== optimistic._id));
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <ScreenHeader title={chat.user.fullName} subtitle={chat.user.online ? 'Online' : `@${chat.user.username}`} onBack={() => navigation.goBack()} />
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ChatBubble message={item} mine={item.sender?._id === user._id} />}
        contentContainerStyle={styles.messages}
      />
      <View style={styles.composer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message..."
          placeholderTextColor={colors.muted}
          style={styles.input}
          multiline
        />
        <Pressable style={styles.send} onPress={send}>
          <Feather name="send" size={20} color={colors.card} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.paper,
    flex: 1,
  },
  messages: {
    padding: 16,
  },
  composer: {
    alignItems: 'flex-end',
    backgroundColor: colors.paper,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    maxHeight: 120,
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  send: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 23,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
});
