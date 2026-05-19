import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { api, apiMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function CommentSheet({ visible, targetType = 'Post', targetId, onClose, isDemo }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState({}); // { [commentId]: replies[] }
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
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

  const loadReplies = async (commentId) => {
    if (isDemo || expandedReplies.has(commentId)) {
      if (expandedReplies.has(commentId)) {
        const next = new Set(expandedReplies);
        next.delete(commentId);
        setExpandedReplies(next);
      } else {
        setExpandedReplies(new Set([...expandedReplies, commentId]));
      }
      return;
    }

    try {
      const response = await api.get(`/comments/${commentId}/replies`);
      setReplies((current) => ({ ...current, [commentId]: response.data.data }));
      setExpandedReplies(new Set([...expandedReplies, commentId]));
    } catch (err) {
      Alert.alert('Error', apiMessage(err, 'Replies load nahi ho paaye.'));
    }
  };

  const toggleLikeComment = async (comment) => {
    if (isDemo) return;
    try {
      const response = await api.post(`/likes/comments/${comment._id}`);
      const { liked, likesCount } = response.data.data;

      const updater = (current) =>
        current.map((c) => {
          if (c._id === comment._id) {
            return {
              ...c,
              likesCount,
              likes: liked ? [...(c.likes || []), user._id] : (c.likes || []).filter((id) => id !== user._id),
            };
          }
          return c;
        });

      if (!comment.parent) {
        setComments(updater);
      } else {
        setReplies((current) => ({
          ...current,
          [comment.parent]: updater(current[comment.parent] || []),
        }));
      }
    } catch (err) {
      Alert.alert('Error', apiMessage(err, 'Like toggle nahi ho paaya.'));
    }
  };

  const deleteComment = async (comment) => {
    if (isDemo) return;
    Alert.alert('Delete Comment', 'Are you sure you want to delete this?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/comments/${comment._id}`);
            if (!comment.parent) {
              setComments((current) => current.filter((c) => c._id !== comment._id));
            } else {
              setReplies((current) => ({
                ...current,
                [comment.parent]: (current[comment.parent] || []).filter((c) => c._id !== comment._id),
              }));
            }
          } catch (err) {
            Alert.alert('Error', apiMessage(err, 'Delete nahi ho paaya.'));
          }
        },
      },
    ]);
  };

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
      const endpoint = replyingTo ? `/comments/${replyingTo._id}/replies` : `/comments/${targetType}/${targetId}`;
      const response = await api.post(endpoint, { text: value });

      if (replyingTo) {
        setReplies((current) => ({
          ...current,
          [replyingTo._id]: [response.data.data, ...(current[replyingTo._id] || [])],
        }));
        setExpandedReplies(new Set([...expandedReplies, replyingTo._id]));
      } else {
        setComments((current) => [response.data.data, ...current]);
      }

      setText('');
      setReplyingTo(null);
    } catch (err) {
      setError(apiMessage(err, 'Comment add nahi ho paaya.'));
    } finally {
      setSending(false);
    }
  };

  const renderComment = (item, isReply = false) => {
    const isLiked = item.likes?.some((id) => id === user?._id);
    const canDelete = item.author?._id === user?._id || user?.role === 'admin';

    return (
      <View key={item._id} style={[styles.comment, isReply && styles.replyComment]}>
        <Avatar user={item.author} size={isReply ? 28 : 34} />
        <View style={styles.commentCopy}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentUser}>@{item.author?.username || 'user'}</Text>
            {canDelete && (
              <Pressable onPress={() => deleteComment(item)}>
                <Feather name="trash-2" size={14} color={colors.muted} />
              </Pressable>
            )}
          </View>
          <Text style={styles.commentText}>{item.text}</Text>
          <View style={styles.commentActions}>
            <Pressable style={styles.commentAction} onPress={() => toggleLikeComment(item)}>
              <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={14} color={isLiked ? colors.coral : colors.muted} />
              <Text style={[styles.actionLabel, isLiked && { color: colors.coral }]}>{item.likesCount || 0}</Text>
            </Pressable>
            {!isReply && (
              <Pressable style={styles.commentAction} onPress={() => setReplyingTo(item)}>
                <Text style={styles.actionLabel}>Reply</Text>
              </Pressable>
            )}
          </View>

          {!isReply && item.commentCount > 0 && (
            <Pressable style={styles.repliesTrigger} onPress={() => loadReplies(item._id)}>
              <View style={styles.repliesLine} />
              <Text style={styles.repliesText}>
                {expandedReplies.has(item._id) ? 'Hide replies' : `View ${item.commentCount} replies`}
              </Text>
            </Pressable>
          )}

          {!isReply && expandedReplies.has(item._id) && replies[item._id] && (
            <View style={styles.repliesList}>{replies[item._id].map((reply) => renderComment(reply, true))}</View>
          )}
        </View>
      </View>
    );
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
              renderItem={({ item }) => renderComment(item)}
            />
          )}

          {replyingTo && (
            <View style={styles.replyingBar}>
              <Text style={styles.replyingText}>
                Replying to <Text style={{ fontWeight: '900' }}>@{replyingTo.author?.username}</Text>
              </Text>
              <Pressable onPress={() => setReplyingTo(null)}>
                <Feather name="x" size={14} color={colors.muted} />
              </Pressable>
            </View>
          )}

          <View style={styles.composer}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={replyingTo ? 'Add a reply...' : 'Add a comment...'}
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
    maxHeight: '85%',
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
    paddingVertical: 12,
  },
  replyComment: {
    paddingVertical: 8,
  },
  commentCopy: {
    flex: 1,
  },
  commentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  commentActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15,
    marginTop: 8,
  },
  commentAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  actionLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  repliesTrigger: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  repliesLine: {
    backgroundColor: colors.line,
    height: 1,
    width: 24,
  },
  repliesText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  repliesList: {
    marginTop: 8,
  },
  replyingBar: {
    alignItems: 'center',
    backgroundColor: colors.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  replyingText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
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
