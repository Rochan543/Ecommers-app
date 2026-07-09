import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Props {
  placeholder?: string;
}

export function SearchBar({ placeholder = 'Search flowers, garlands, pooja items...' }: Props) {
  const colors = useColors();
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: '#fff', borderColor: colors.border }]}
      onPress={() => router.push('/search')}
      activeOpacity={0.85}
    >
      <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
      <Text style={[styles.text, { color: colors.mutedForeground }]}>{placeholder}</Text>
      <Ionicons name="mic-outline" size={18} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  text: { flex: 1, fontSize: 14 },
});
