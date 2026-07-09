import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import * as Haptics from 'expo-haptics';

interface Props {
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  size?: 'small' | 'medium';
}

export function QuantitySelector({ quantity, onAdd, onRemove, size = 'small' }: Props) {
  const colors = useColors();
  const isSmall = size === 'small';

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAdd();
  };

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRemove();
  };

  if (quantity === 0) {
    return (
      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: colors.card, borderColor: colors.secondary }, isSmall ? styles.addBtnSmall : styles.addBtnMedium]}
        onPress={handleAdd}
        activeOpacity={0.8}
      >
        <Text style={[styles.addText, { color: colors.secondary }, isSmall ? styles.addTextSmall : styles.addTextMedium]}>ADD</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.counter, { backgroundColor: colors.secondary }, isSmall ? styles.counterSmall : styles.counterMedium]}>
      <TouchableOpacity style={styles.btn} onPress={handleRemove} activeOpacity={0.8}>
        <Text style={[styles.btnText, isSmall ? styles.btnTextSmall : styles.btnTextMedium]}>−</Text>
      </TouchableOpacity>
      <Text style={[styles.countText, isSmall ? styles.countTextSmall : styles.countTextMedium]}>{quantity}</Text>
      <TouchableOpacity style={styles.btn} onPress={handleAdd} activeOpacity={0.8}>
        <Text style={[styles.btnText, isSmall ? styles.btnTextSmall : styles.btnTextMedium]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  addBtnSmall: { width: 72, height: 30 },
  addBtnMedium: { width: 90, height: 36 },
  addText: { fontWeight: '700' },
  addTextSmall: { fontSize: 13 },
  addTextMedium: { fontSize: 15 },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  counterSmall: { width: 72, height: 30 },
  counterMedium: { width: 90, height: 36 },
  btn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '800' },
  btnTextSmall: { fontSize: 18, lineHeight: 22 },
  btnTextMedium: { fontSize: 22, lineHeight: 26 },
  countText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  countTextSmall: { fontSize: 13, minWidth: 22 },
  countTextMedium: { fontSize: 15, minWidth: 26 },
});
