import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

const { width: W } = Dimensions.get('window');

const FLOWER_IMAGES = [
  'https://images.unsplash.com/photo-1487530811015-780f5d74b80b?w=200',
  'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=200',
  'https://images.unsplash.com/photo-1560717845-968823efbee1?w=200',
  'https://images.unsplash.com/photo-1490750967868-88df5691cc1a?w=200',
  'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200',
  'https://images.unsplash.com/photo-1597696929736-6d13bed8e6a8?w=200',
  'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=200',
  'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=200',
  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200',
];

const API_BASE = `https://${process.env['EXPO_PUBLIC_DOMAIN']}`;

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env['EXPO_PUBLIC_GOOGLE_CLIENT_ID'] ?? '',
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Token,
      redirectUri: AuthSession.makeRedirectUri({
        scheme: 'vr-garlands',
      }),
    },
    discovery,
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const accessToken = response.params['access_token'];
      if (accessToken) {
        handleGoogleSuccess(accessToken);
      }
    } else if (response?.type === 'error') {
      Alert.alert('Sign-in failed', 'Google sign-in was cancelled or failed. Please try again.');
      setLoading(false);
    }
  }, [response]);

  const handleGoogleSuccess = async (accessToken: string) => {
    setLoading(true);
    try {
      // Fetch user info from Google
      const userInfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await userInfoRes.json() as {
        id: string;
        email: string;
        name: string;
        picture: string;
      };

      // Send access token to backend — server verifies it with Google
      const authRes = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      if (!authRes.ok) {
        throw new Error('Backend authentication failed');
      }

      const { token, user } = await authRes.json() as { token: string; user: Parameters<typeof login>[1] };

      await login(token, user);
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert('Sign-in error', 'Failed to complete sign-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await promptAsync();
    } catch {
      setLoading(false);
    }
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: '#1A1A1A' }]}>
      {/* Floating flower images grid */}
      <View style={[styles.imageGrid, { top: topPad }]}>
        {FLOWER_IMAGES.map((uri, i) => (
          <View
            key={i}
            style={[
              styles.imageCell,
              { opacity: 0.85 + Math.random() * 0.15 },
            ]}
          >
            <Image source={{ uri }} style={styles.cellImage} resizeMode="cover" />
          </View>
        ))}
      </View>

      {/* Gradient overlay */}
      <View style={styles.overlay} />

      {/* Bottom sheet */}
      <View style={[styles.sheet, { paddingBottom: bottomPad + 24 }]}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={[styles.logoBg, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoEmoji}>🌸</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: '#FFFFFF' }]}>VR Garlands</Text>
        <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.7)' }]}>
          India's premier flower & pooja app
        </Text>
        <Text style={[styles.cta, { color: 'rgba(255,255,255,0.5)' }]}>
          Log in or sign up
        </Text>

        <TouchableOpacity
          style={[
            styles.googleBtn,
            { backgroundColor: colors.primary, opacity: loading || !request ? 0.7 : 1 },
          ]}
          onPress={handleSignIn}
          disabled={loading || !request}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#1A1A1A" />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.terms, { color: 'rgba(255,255,255,0.35)' }]}>
          By continuing, you agree to our{' '}
          <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Terms of Service</Text>
          {' & '}
          <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
}

const CELL = (W - 32) / 3;

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageGrid: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    zIndex: 1,
  },
  imageCell: {
    width: CELL,
    height: CELL,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cellImage: { width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 3,
    padding: 24,
    alignItems: 'center',
  },
  logoWrap: { marginBottom: 12 },
  logoBg: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F5A800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoEmoji: { fontSize: 30 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 4 },
  cta: { fontSize: 15, marginBottom: 28 },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    gap: 10,
    marginBottom: 16,
  },
  googleIcon: { fontSize: 18, fontWeight: '900', color: '#1A1A1A' },
  googleText: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  terms: { fontSize: 11, textAlign: 'center', lineHeight: 18 },
});
