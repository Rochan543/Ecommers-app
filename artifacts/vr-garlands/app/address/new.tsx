import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useCreateAddress } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetAddressesQueryKey } from '@workspace/api-client-react';
import { useRouter } from 'expo-router';

export default function NewAddressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  const createMutation = useCreateAddress({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAddressesQueryKey() });
        router.back();
      },
      onError: () => {
        Alert.alert('Error', 'Failed to save address. Please try again.');
      },
    },
  });

  const field = (key: keyof typeof form) => ({
    value: form[key] as string,
    onChangeText: (v: string) => setForm((prev) => ({ ...prev, [key]: v })),
  });

  const handleSave = () => {
    if (!form.name || !form.phone || !form.address || !form.city || !form.state || !form.pincode) {
      Alert.alert('All fields required', 'Please fill in all address fields.');
      return;
    }
    createMutation.mutate({ data: form });
  };

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad + 100 }}>
        <View style={styles.form}>
          {[
            { label: 'Full Name', key: 'name' as const, placeholder: 'Enter full name' },
            { label: 'Phone', key: 'phone' as const, placeholder: '+91 XXXXX XXXXX', keyType: 'phone-pad' as const },
            { label: 'Address', key: 'address' as const, placeholder: 'House/Flat no, Street, Area', multiline: true },
            { label: 'City', key: 'city' as const, placeholder: 'City' },
            { label: 'State', key: 'state' as const, placeholder: 'State' },
            { label: 'PIN Code', key: 'pincode' as const, placeholder: 'PIN Code', keyType: 'number-pad' as const },
          ].map(({ label, key, placeholder, keyType, multiline }) => (
            <View key={key} style={styles.fieldWrap}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    color: colors.foreground,
                    height: multiline ? 80 : 48,
                    textAlignVertical: multiline ? 'top' : 'center',
                  },
                ]}
                placeholder={placeholder}
                placeholderTextColor={colors.mutedForeground}
                keyboardType={keyType ?? 'default'}
                multiline={multiline}
                {...field(key)}
              />
            </View>
          ))}

          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: colors.foreground }]}>Set as default address</Text>
            <Switch
              value={form.isDefault}
              onValueChange={(v) => setForm((prev) => ({ ...prev, isDefault: v }))}
              trackColor={{ false: colors.border, true: colors.secondary }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad + 12, borderTopColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.secondary, opacity: createMutation.isPending ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={createMutation.isPending}
          activeOpacity={0.85}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save Address</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 16 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingTop: 12, fontSize: 15 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  switchLabel: { fontSize: 15 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingTop: 12, borderTopWidth: 1 },
  saveBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
