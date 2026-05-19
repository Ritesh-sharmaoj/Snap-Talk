import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { colors } from '../theme/colors';
import { api, apiMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import UserRow from '../components/UserRow';
import AppButton from '../components/AppButton';

export default function UserListScreen({ route, navigation }) {
  const { title, username, type } = route.params;
  const { isDemo } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followed, setFollowed] = useState({});
  const [loadingAction, setLoadingAction] = useState({});

  useEffect(() => {
    const loadUsers = async () => {
      if (isDemo) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const endpoint = `/users/${username}/${type}`;
        const response = await api.get(endpoint);
        setUsers(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [username, type, isDemo]);

  const toggleFollow = async (user) => {
    const current = Object.prototype.hasOwnProperty.call(followed, user._id) ? followed[user._id] : Boolean(user.isFollowing);
    setFollowed((state) => ({ ...state, [user._id]: !current }));

    if (isDemo) return;

    try {
      setLoadingAction((state) => ({ ...state, [user._id]: true }));
      if (current) {
        await api.delete(`/follow/${user._id}`);
      } else {
        await api.post(`/follow/${user._id}`);
      }
    } catch (_error) {
      setFollowed((state) => ({ ...state, [user._id]: current }));
    } finally {
      setLoadingAction((state) => ({ ...state, [user._id]: false }));
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title={title} onBack={() => navigation.goBack()} />
      {loading ? (
        <View style={styles.center}>
          <Text style={styles.info}>Loading list...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <UserRow
              user={item}
              onPress={() => navigation.navigate('Profile', { username: item.username })}
              right={
                <AppButton
                  label={(Object.prototype.hasOwnProperty.call(followed, item._id) ? followed[item._id] : item.isFollowing) ? 'Following' : 'Follow'}
                  variant={(Object.prototype.hasOwnProperty.call(followed, item._id) ? followed[item._id] : item.isFollowing) ? 'ghost' : 'primary'}
                  loading={loadingAction[item._id]}
                  onPress={() => toggleFollow(item)}
                  style={styles.btn}
                />
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.info}>No users found.</Text>
            </View>
          }
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
  list: {
    padding: 16,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: 100,
  },
  info: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '700',
  },
  btn: {
    minWidth: 100,
  },
});
