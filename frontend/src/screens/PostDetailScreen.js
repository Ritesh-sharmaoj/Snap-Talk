import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import ScreenHeader from '../components/ScreenHeader';
import LoadingOverlay from '../components/LoadingOverlay';
import CommentSheet from '../components/CommentSheet';

export default function PostDetailScreen({ route, navigation }) {
  const { isDemo } = useAuth();
  const [post, setPost] = useState(route.params?.post || null);
  const [loading, setLoading] = useState(!post);
  const [commentTarget, setCommentTarget] = useState(null);

  useEffect(() => {
    if (post) return;

    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${route.params.postId}`);
        setPost(response.data.data);
      } catch (error) {
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [post, route.params?.postId, navigation]);

  const likePost = async (p) => {
    const response = await api.post(`/likes/posts/${p._id}`);
    return response.data.data;
  };

  const savePost = async (p) => {
    const response = await api.post(`/posts/${p._id}/save`);
    return response.data.data;
  };

  const sharePost = async (p) => {
    const response = await api.post(`/posts/${p._id}/share`);
    return response.data.data;
  };

  if (loading) return <LoadingOverlay />;
  if (!post) return null;

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Post" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PostCard
          post={post}
          onComment={() => setCommentTarget(post)}
          onLike={likePost}
          onSave={savePost}
          onShare={sharePost}
          onProfile={(author) => navigation.navigate('Profile', { username: author.username })}
        />
      </ScrollView>
      <CommentSheet
        visible={Boolean(commentTarget)}
        targetType="Post"
        targetId={commentTarget?._id}
        isDemo={isDemo}
        onClose={() => setCommentTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.paper,
    flex: 1,
  },
  content: {
    padding: 16,
  },
});
