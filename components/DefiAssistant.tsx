import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useDefiCoach } from '../hooks/useDefiCoach';
import { initNotifications, scheduleDailyMessages } from '../lib/defiScheduler';

export default function DefiAssistant() {
  const { message } = useDefiCoach('onDemand');

  const onEnableNotifications = async () => {
    try {
      await initNotifications();
      await scheduleDailyMessages();
    } catch (e) {
      console.log('Notifications error:', e);
    }
  };

  return (
    <View style={{ padding: 16, backgroundColor: '#16a34a', borderRadius: 16 }}>
      {/* Başlık mutlaka <Text> içinde */}
      <Text style={{ color: 'white', fontSize: 12, opacity: 0.9 }}>
        Defi — Kişisel Koç
      </Text>

      {/* Mesaj mutlaka <Text> içinde */}
      <Text style={{ color: 'white', fontSize: 16, marginTop: 8 }}>
        {message}
      </Text>

      {/* Butonlar: Pressable içinde SADECE <Text> çocuk olmalı */}
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <Pressable
          onPress={() => {}}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: '#0f172a',
            borderRadius: 12,
            marginRight: 8,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Günün Özeti</Text>
        </Pressable>

        <Pressable
          onPress={() => {}}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: '#334155',
            borderRadius: 12,
            marginRight: 8,
          }}
        >
          <Text style={{ color: 'white' }}>Takviyeler</Text>
        </Pressable>

        <Pressable
          onPress={onEnableNotifications}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: '#111827',
            borderRadius: 12,
          }}
        >
          <Text style={{ color: 'white' }}>Bildirimleri Aç</Text>
        </Pressable>
      </View>
    </View>
  );
}