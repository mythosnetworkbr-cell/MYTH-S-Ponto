import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { API_URL, GOOGLE_ANDROID_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from '../src/config';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || undefined,
    webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response?.type !== 'success') return;
    const token = response.authentication?.accessToken;
    if (token) loginWithGoogle(token);
  }, [response]);

  async function loginWithGoogle(accessToken: string) {
    if (!API_URL) { Alert.alert('MYTHØS Ponto', 'A API Google Sheets ainda não foi configurada para este build.'); return; }
    setLoading(true);
    try {
      const google = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${accessToken}` } }).then(r => r.json());
      const result = await fetch(API_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'user',gmail:google.email,accessToken}) }).then(r=>r.json());
      if (!result.ok) throw new Error(result.error || 'Conta Google não autorizada');
      await AsyncStorage.multiSet([['mythos.user',JSON.stringify(result.user)],['mythos.role',result.user.cargo],['mythos.accessToken',accessToken]]);
      router.replace('/');
    } catch (e) { Alert.alert('Não foi possível entrar', e instanceof Error ? e.message : 'Tente novamente.'); }
    finally { setLoading(false); }
  }

  return <SafeAreaView style={styles.safe}><View style={styles.container}>
    <View style={styles.logo}><Text style={styles.mark}>M</Text></View>
    <Text style={styles.brand}>MYTHØS</Text><Text style={styles.product}>PONTO</Text>
    <Text style={styles.tagline}>DISCIPLINA • FOCO • RESULTADOS</Text>
    <View style={styles.card}><Text style={styles.title}>Bem-vindo</Text><Text style={styles.subtitle}>Entre com sua conta Google para acessar o MYTHØS Ponto.</Text>
      <Pressable style={styles.google} onPress={()=>promptAsync()} disabled={!request || loading}>{loading?<ActivityIndicator/>:<Text style={styles.googleG}>G</Text>}<Text style={styles.googleText}>{loading?'Conectando…':'Continuar com o Google'}</Text></Pressable>
      <View style={styles.secure}><Text style={styles.dot}>✓</Text><Text style={styles.secureText}>Conexão online obrigatória</Text></View>
      <View style={styles.secure}><Text style={styles.dot}>✓</Text><Text style={styles.secureText}>Cargo e permissões vinculados à conta Google autorizada</Text></View>
    </View><Text style={styles.footer}>MYTHØS NETWORK • PONTO</Text>
  </View></SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:'#050812'},container:{flex:1,justifyContent:'center',padding:28,alignItems:'center'},logo:{width:116,height:116,borderRadius:34,backgroundColor:'#0b1425',borderWidth:1,borderColor:'#8b5cf6',alignItems:'center',justifyContent:'center'},mark:{fontSize:72,fontWeight:'900',fontStyle:'italic',color:'#a98cff'},brand:{marginTop:20,color:'#fff',fontSize:34,fontWeight:'900',letterSpacing:4},product:{color:'#9b7cff',fontSize:18,fontWeight:'800',letterSpacing:7,marginTop:2},tagline:{color:'#7d879b',fontSize:10,fontWeight:'700',letterSpacing:2,marginTop:10},card:{width:'100%',marginTop:42,padding:24,borderRadius:24,backgroundColor:'#0d1220',borderWidth:1,borderColor:'#2b2450'},title:{color:'#fff',fontSize:25,fontWeight:'800'},subtitle:{color:'#8e98aa',fontSize:14,lineHeight:21,marginTop:8,marginBottom:22},google:{height:56,borderRadius:15,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',flexDirection:'row',gap:12},googleG:{fontSize:22,fontWeight:'900',color:'#4285F4'},googleText:{fontSize:15,fontWeight:'800',color:'#16181d'},secure:{flexDirection:'row',alignItems:'center',gap:9,marginTop:15},dot:{color:'#52d6a1',fontWeight:'900'},secureText:{color:'#697489',fontSize:12,flex:1},footer:{position:'absolute',bottom:30,color:'#4e596c',fontSize:10,fontWeight:'800',letterSpacing:3}});
