import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { mockAdmin } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import ScreenHeader from '../components/ScreenHeader';

const StatCard = ({ icon, label, value }) => (
  <View style={styles.statCard}>
    <View style={styles.statIcon}>
      <Feather name={icon} size={18} color={colors.mintDark} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function AdminDashboardScreen({ navigation }) {
  const { isDemo } = useAuth();
  const [stats, setStats] = useState(mockAdmin.stats);
  const [reports, setReports] = useState(mockAdmin.reports);

  useEffect(() => {
    const load = async () => {
      if (isDemo) return;

      try {
        const [statsRes, reportsRes] = await Promise.all([api.get('/admin/dashboard'), api.get('/admin/reports')]);
        setStats(statsRes.data.data);
        setReports(reportsRes.data.data);
      } catch (_error) {
        setStats(mockAdmin.stats);
        setReports(mockAdmin.reports);
      }
    };

    load();
  }, [isDemo]);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Admin dashboard" subtitle="Users, reports, moderation" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          <StatCard icon="users" label="Users" value={stats.users} />
          <StatCard icon="image" label="Posts" value={stats.posts} />
          <StatCard icon="play-circle" label="Reels" value={stats.reels} />
          <StatCard icon="flag" label="Open reports" value={stats.openReports} />
        </View>
        <Text style={styles.section}>Recent reports</Text>
        {reports.map((report) => (
          <View key={report._id} style={styles.report}>
            <Avatar user={report.reporter} size={44} />
            <View style={styles.reportCopy}>
              <Text style={styles.reportTitle}>{report.targetType} reported for {report.reason}</Text>
              <Text style={styles.reportMeta}>Status: {report.status}</Text>
            </View>
            <View style={styles.statusDot} />
          </View>
        ))}
      </ScrollView>
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
    paddingBottom: 28,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    width: '48.5%',
  },
  statIcon: {
    alignItems: 'center',
    backgroundColor: '#E6FBF5',
    borderRadius: 15,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  statValue: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 12,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  section: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 12,
    marginTop: 24,
  },
  report: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    padding: 12,
  },
  reportCopy: {
    flex: 1,
  },
  reportTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  reportMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  statusDot: {
    backgroundColor: colors.coral,
    borderRadius: 6,
    height: 12,
    width: 12,
  },
});
