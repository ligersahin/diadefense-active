import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
type Props = { onStart: () => void };
export default function WelcomeScreen({ onStart }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Merhaba, ben Defi 💚</Text>
      <Text style={styles.subtitle}>Diyabet Canavarı’nı birlikte ehlileştireceğiz. Bugün küçük bir adım atalım mı?</Text>
      <TouchableOpacity style={styles.button} onPress={onStart}><Text style={styles.buttonText}>Hazırım!</Text></TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#FFF',padding:24,justifyContent:'center'},
  title:{fontSize:26,fontWeight:'700',color:'#1A1A1A',marginBottom:12},
  subtitle:{fontSize:16,color:'#333',lineHeight:22,marginBottom:24},
  button:{backgroundColor:'#3CB371',borderRadius:16,paddingVertical:14,alignItems:'center'},
  buttonText:{color:'#fff',fontSize:16,fontWeight:'600'}
});