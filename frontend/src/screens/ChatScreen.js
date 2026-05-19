import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { mockMessages } from '../data/mockData';
import ChatBubble from '../components/ChatBubble';
import ScreenHeader from '../components/ScreenHeader';

export default function ChatScreen({ navigation, route }) {
  const { chat } = route.params || {};
  const { user, isDemo } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [otherUser, setOtherUser] = useState(chat?.user || {});
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!chat?.user) {
      navigation.goBack();
    }
  }, [chat, navigation]);

  const loadMessages = useCallback(async () => {
    if (!chat?.user?._id) return;
    try {
      setLoading(true);
      if (isDemo) {
        setMessages(mockMessages);
        return;
      }

      const response = await api.get(`/messages/${chat.user._id}`);
      setMessages(response.data.data);
      await api.patch(`/messages/${chat.user._id}/seen`);
    } catch (_error) {
      setMessages(mockMessages);
    } finally {
      setLoading(false);
    }
  }, [chat?.user?._id, isDemo]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !otherUser?._id) return undefined;

    const onMessage = (message) => {
      const isThisChat = message.sender?._id === otherUser._id || message.recipient?._id === otherUser._id;
      if (isThisChat) {
        setMessages((current) => {
          const exists = current.find((m) => m._id === message._id);
          if (exists) return current;
          return [...current, message];
        });
        if (message.recipient?._id === user?._id) {
          api.patch(`/messages/${otherUser._id}/seen`).catch(() => {});
        }
      }
    };

    const onSeen = ({ conversationId }) => {
      const myConversationId = [String(user?._id), String(otherUser._id)].sort().join(':');
      if (conversationId === myConversationId) {
        setMessages((current) =>
          current.map((m) => ((m.recipient?._id || m.recipient) === otherUser._id ? { ...m, seen: true } : m))
        );
      }
    };

    const onPresence = ({ userId, online }) => {
      if (userId === otherUser._id) {
        setOtherUser((prev) => ({ ...prev, online }));
      }
    };

    socket.on('message:new', onMessage);
    socket.on('message:sent', onMessage);
    socket.on('message:seen', onSeen);
    socket.on('presence:update', onPresence);

    return () => {
      socket.off('message:new', onMessage);
      socket.off('message:sent', onMessage);
      socket.off('message:seen', onSeen);
      socket.off('presence:update', onPresence);
    };
  }, [otherUser?._id, user?._id]);

  const sendText = async () => {
    const value = text.trim();
    if (!value || !otherUser?._id) return;

    const tempId = `local-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      sender: user,
      recipient: otherUser,
      text: value,
      type: 'text',
      createdAt: new Date().toISOString(),
      seen: false,
      sending: true,
    };

    setMessages((current) => [...current, optimistic]);
    setText('');

    if (isDemo) {
      setMessages((current) =>
        current.map((m) => (m._id === tempId ? { ...m, sending: false } : m))
      );
      return;
    }

    try {
      const response = await api.post('/messages', { recipientId: otherUser._id, text: value, type: 'text' });
      const realMessage = response.data.data;
      setMessages((current) =>
        current.map((m) => (m._id === tempId ? { ...realMessage, sending: false } : m))
      );
    } catch (_error) {
      setMessages((current) => current.filter((m) => m._id !== tempId));
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      sendImage(result.assets[0].uri);
    }
  };

  const sendImage = async (uri) => {
    if (!otherUser?._id) return;
    const tempId = `local-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      sender: user,
      recipient: otherUser,
      mediaUrl: uri,
      type: 'image',
      createdAt: new Date().toISOString(),
      seen: false,
      sending: true,
    };

    setMessages((current) => [...current, optimistic]);

    if (isDemo) {
      setMessages((current) =>
        current.map((m) => (m._id === tempId ? { ...m, sending: false } : m))
      );
      return;
    }

    try {
      const response = await api.post('/messages', {
        recipientId: otherUser._id,
        mediaUrl: uri,
        type: 'image',
      });
      const realMessage = response.data.data;
      setMessages((current) =>
        current.map((m) => (m._id === tempId ? { ...realMessage, sending: false } : m))
      );
    } catch (_error) {
      setMessages((current) => current.filter((m) => m._id !== tempId));
    }
  };

  if (!otherUser?._id) return null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <ScreenHeader
        title={otherUser.fullName || 'Chat'}
        subtitle={otherUser.online ? 'Online' : otherUser.username ? `@${otherUser.username}` : ''}
        onBack={() => navigation.goBack()}
      />
      {loading && messages.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.mintDark} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ChatBubble message={item} mine={(item.sender?._id || item.sender) === user?._id} />
          )}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}
      <View style={styles.composer}>
        <Pressable style={styles.attach} onPress={pickImage}>
          <Feather name="image" size={22} color={colors.muted} />
        </Pressable>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message..."
          placeholderTextColor={colors.muted}
          style={styles.input}
          multiline
        />
        <Pressable style={styles.send} onPress={sendText}>
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
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  messages: {
    padding: 16,
    paddingBottom: 32,
  },
  composer: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  attach: {
    padding: 8,
  },
  input: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    maxHeight: 100,
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  send: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
