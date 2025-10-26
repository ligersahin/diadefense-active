import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function initNotifications() {
  if (!Device.isDevice) return;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('defi-default', {
      name: 'Defi',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function scheduleDailyMessages() {
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Defi — Günaydın', body: '15 dk yürüyüş + menüye sadakat. 🔰', sound: true },
    trigger: { hour: 9, minute: 0, repeats: true },
  });

  await Notifications.scheduleNotificationAsync({
    content: { title: 'Defi — Akşam Kontrolü', body: 'Yürüyüş/Takviye/Menü kontrolü yapmayı unutma.', sound: true },
    trigger: { hour: 21, minute: 0, repeats: true },
  });
}