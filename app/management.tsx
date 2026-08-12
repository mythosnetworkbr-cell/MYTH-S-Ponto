import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { api } from '../src/api/mythosApi';

export default function Management(){
 const [user,setUser]=useState<any>(); const [data,setData]=useState<any[]>([]); const [loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{const raw=await AsyncStorage.getItem('mythos.user');const token=await AsyncStorage.getItem('mythos.accessToken');if(!raw){router.replace('/login');return;}const u=JSON.parse(raw);setUser(u);const r=await api<any>({action:'reports',gmail:u.gmail},token||undefined);if(r.ok)setData(r.data.records||[]);setLoading(false)})()},[]);
 return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.container}><Text style={styles.back} onPress={()=>router.back()}>‹ Voltar</Text><Text style={styles.title}>Relatórios</Text><Text style={styles.muted}>{user?.nome} • {user?.cargo}</Text>{loading?<ActivityIndicator/>:data.length?data.map((x,i)=><View style={styles.card} key={x.id||i}><Text style={styles.heading}>{x.tipo||'Relatório'}</Text><Text style={styles.muted}>{x.equipe||'Geral'}</Text><Text style={styles.body}>{x.relatorio}</Text></View>):<View style={styles.card}><Text style={styles.heading}>Nenhum relatório</Text><Text style={styles.muted}>Ainda não há relatórios disponíveis.</Text></View>}</ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:'#08090d'},container:{padding:22,gap:14},back:{color:'#a98cff',fontSize:15},title:{color:'#fff',fontSize:34,fontWeight:'800'},muted:{color:'#8f95a8',fontSize:13},card:{backgroundColor:'#11131a',borderRadius:18,padding:18,gap:8,borderWidth:1,borderColor:'#222532'},heading:{color:'#fff',fontSize:17,fontWeight:'700'},body:{color:'#d9dbe2',lineHeight:21}});
