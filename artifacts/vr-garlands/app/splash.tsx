<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
=======
import React, { useEffect, useCallback } from 'react';
>>>>>>> 4e5fa148011f842be5ef2a3e5fc74bfe823ce968
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const { width: W, height: H } = Dimensions.get('window');

const PETALS = [
  { top: 0.10, left: 0.07, delay: 350, angle: '30deg', size: 30 },
  { top: 0.07, left: 0.73, delay: 550, angle: '-20deg', size: 26 },
  { top: 0.22, left: 0.02, delay: 750, angle: '60deg', size: 22 },
  { top: 0.63, left: 0.83, delay: 480, angle: '-45deg', size: 28 },
  { top: 0.70, left: 0.05, delay: 650, angle: '15deg', size: 24 },
  { top: 0.80, left: 0.76, delay: 850, angle: '-60deg', size: 20 },
  { top: 0.42, left: 0.88, delay: 600, angle: '45deg', size: 18 },
  { top: 0.33, left: 0.01, delay: 700, angle: '-30deg', size: 16 },
];

function Petal({ top, left, delay, angle, size }: { top: number; left: number; delay: number; angle: string; size: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);
  const scale = useSharedValue(0.2);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.75, { duration: 900 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 900, easing: Easing.out(Easing.quad) }));
    scale.value = withDelay(delay, withTiming(1, { duration: 900, easing: Easing.out(Easing.back(1.1)) }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }, { rotate: angle }],
  }));

  return (
    <Animated.View style={[styles.petal, { top: top * H, left: left * W }, style]}>
      <Text style={{ fontSize: size }}>🌸</Text>
    </Animated.View>
  );
}

export default function SplashScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
<<<<<<< HEAD
  const [animationDone, setAnimationDone] = useState(false);
=======
>>>>>>> 4e5fa148011f842be5ef2a3e5fc74bfe823ce968

  const bgOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.35);
  const logoOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const sweepX = useSharedValue(-W * 0.6);
  const sweepOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

<<<<<<< HEAD
  // Navigate once animation is done AND auth has loaded — avoids stale closure bug
  useEffect(() => {
    if (animationDone && !loading) {
      router.replace(user ? '/(tabs)' : '/(auth)/login');
    }
  }, [animationDone, loading, user, router]);
=======
  const navigate = useCallback(() => {
    if (!loading) {
      router.replace(user ? '/(tabs)' : '/(auth)/login');
    }
  }, [user, loading, router]);
>>>>>>> 4e5fa148011f842be5ef2a3e5fc74bfe823ce968

  useEffect(() => {
    // 0ms — background fades in
    bgOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });

    // 300ms — logo scales in
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    logoScale.value = withDelay(300, withTiming(1, { duration: 700, easing: Easing.out(Easing.back(1.25)) }));

    // 700ms — glow pulse
    glowOpacity.value = withDelay(700, withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(0.6, { duration: 300 }),
      withTiming(1, { duration: 400 }),
    ));

    // 900ms — tagline fades in
    textOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));

    // 1200ms — gold light sweep
    sweepOpacity.value = withDelay(1200, withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(0, { duration: 600 }),
    ));
    sweepX.value = withDelay(1200, withTiming(W * 1.4, { duration: 750, easing: Easing.inOut(Easing.quad) }));

<<<<<<< HEAD
    // 2500ms — fade out; signal JS side that animation finished
    containerOpacity.value = withDelay(2500, withTiming(0, { duration: 500 }, (finished) => {
      if (finished) runOnJS(setAnimationDone)(true);
=======
    // 2500ms — fade out and navigate
    containerOpacity.value = withDelay(2500, withTiming(0, { duration: 500 }, (finished) => {
      if (finished) runOnJS(navigate)();
>>>>>>> 4e5fa148011f842be5ef2a3e5fc74bfe823ce968
    }));
  }, []);

  const bgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  const sweepStyle = useAnimatedStyle(() => ({
    opacity: sweepOpacity.value,
    transform: [{ translateX: sweepX.value }],
  }));
  const containerStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Gradient background */}
      <Animated.View style={[StyleSheet.absoluteFillObject, bgStyle]}>
        <LinearGradient
          colors={['#0D0500', '#2B1000', '#1A0800', '#0D0500']}
          style={StyleSheet.absoluteFillObject}
          locations={[0, 0.3, 0.7, 1]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
        />
      </Animated.View>

      {/* Floating petals */}
      {PETALS.map((p, i) => <Petal key={i} {...p} />)}

      {/* Gold sweep */}
      <Animated.View style={[styles.sweep, sweepStyle]} pointerEvents="none" />

      {/* Logo */}
      <Animated.View style={styles.logoWrap}>
        <Animated.View style={[styles.glow, glowStyle]} />
        <Animated.View style={logoStyle}>
          <View style={styles.logoBg}>
            <Text style={styles.logoEmoji}>🌸</Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Text */}
      <Animated.View style={[styles.textWrap, textStyle]}>
        <Text style={styles.title}>VR Garlands</Text>
        <Text style={styles.subtitle}>India's Premier Flower & Pooja App</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petal: {
    position: 'absolute',
  },
  sweep: {
    position: 'absolute',
    top: 0,
    left: -W * 0.6,
    width: W * 0.45,
    height: H,
    backgroundColor: 'rgba(245,168,0,0.12)',
    transform: [{ skewX: '-12deg' }],
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(245,168,0,0.35)',
  },
  logoBg: {
    width: 108,
    height: 108,
    borderRadius: 30,
    backgroundColor: '#F5A800',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F5A800',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 28,
    elevation: 16,
  },
  logoEmoji: { fontSize: 56 },
  textWrap: {
    alignItems: 'center',
    marginTop: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(245,168,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 6,
    letterSpacing: 0.3,
  },
});
