import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { api, apiMessage } from '../api/client';
import Avatar from './Avatar';

export default function CommentSheet({ visible, targetType = 'Post', targetId, onClose, isDemo }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!visible || !targetId || isDemo) {
        setComments([]);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/comments/${targetType}/${targetId}`);
        setComments(response.data.data);
      } catch (err) {
        setError(apiMessage(err, 'Comments load nahi ho paaye.'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [visible, targetId, targetType, isDemo]);

  const send = async () => {
    const value = text.trim();
    if (!value || sending) return;

    if (isDemo) {
      setComments((current) => [
        {
          _id: `demo-comment-${Date.now()}`,
          text: value,
          author: { username: 'you', fullName: 'You' },
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
      setText('');
      return;
    }

    try {
      setSending(true);
      setError('');
      const response = await api.post(`/comments/${targetType}/${targetId}`, { text: value });
      setComments((current) => [response.data.data, ...current]);
      setText('');
    } catch (err) {
      setError(apiMessage(err, 'Comment add nahi ho paaya.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Comments</Text>
            <Pressable onPress={onClose} style={styles.close}>
              <Feather name="x" size={20} color={colors.ink} />
            </Pressable>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {loading ? (
            <ActivityIndicator color={colors.mintDark} style={styles.loader} />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.list}
              ListEmptyComponent={<Text style={styles.empty}>No comments yet.</Text>}
              renderItem={({ item }) => (
                <View style={styles.comment}>
                  <Avatar user={item.author} size={34} />
                  <View style={styles.commentCopy}>
                    <Text style={styles.commentUser}>@{item.author?.username || 'user'}</Text>
                    <Text style={styles.commentText}>{item.text}</Text>
                  </View>
                </View>
              )}
            />
          )}
          <View style={styles.composer}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Add a comment..."
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <Pressable style={styles.send} onPress={send}>
              {sending ? <ActivityIndicator color={colors.card} /> : <Feather name="send" size={18} color={colors.card} />}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(16,23,34,0.35)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '78%',
    minHeight: '52%',
    paddingBottom: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  close: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 16,
  },
  loader: {
    marginTop: 30,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  empty: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 24,
    textAlign: 'center',
  },
  comment: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  commentCopy: {
    flex: 1,
  },
  commentUser: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  commentText: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  composer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    height: 48,
    paddingHorizontal: 12,
  },
  send: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
