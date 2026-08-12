import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../src/api/mythosApi';

export default function Reports(){
  const [rows,setRows]=useState<any[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
  useEffect(()=>{(async()=>{const user=JSON.parse((await AsyncStorage.getItem('mythos.user'))||'null');const token=await AsyncStorage.getItem('mythos.accessToken');if(!user){router.replace('/login');return;}const r=await api<any>({action:'reports',gmail:user.gmail},token||undefined);if(r.ok)setRows(r.data.records||[]);else setError(r.error);setLoading(false)})()},[]);
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.c}><Pressable onPress={()=>router.back()}><Text style={s.back}>‹ Voltar</Text></Pressable><Text style={s.brand}>MYTHØS</Text><Text style={s.title}>Relatórios</Text>{loading?<ActivityIndicator/>:error?<Text style={s.error}>{error}</Text>:rows.length===0?<Text style={s.muted}>Nenhum relatório registrado.</Text>:rows.map((r,i)=><View style={s.card} key={String(r.id||i)}><Text style={s.type}>{r.tipo||'Relatório'}</Text><Text style={s.text}>{r.relatorio||'Sem conteúdo'}</Text><Text style={s.muted}>{r.data||r.enviado_em||''}</Text></View>)}</ScrollView></SafeAreaView>}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:'#08090d'},c:{padding:22,gap:14},back:{color:'#b79cff',fontWeight:'700'},brand:{color:'#9b7cff',fontWeight:'900',letterSpacing:3,fontSize:13},title:{color:'#fff',fontSize:34,fontWeight:'900'},card:{backgroundColor:'#11131a',borderRadius:18,padding:18,borderWidth:1,borderColor:'#222532',gap:8},type:{color:'#fff',fontWeight:'800'},text:{color:'#d8dbe5',lineHeight:21},muted:{color:'#8f95a8',fontSize:13},error:{color:'#ff9aa8'}});
