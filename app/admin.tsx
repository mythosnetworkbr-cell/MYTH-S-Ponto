import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { api } from '../src/api/mythosApi';

export default function Admin(){
 const [user,setUser]=useState<any>();const [users,setUsers]=useState<any[]>([]);const [audit,setAudit]=useState<any[]>([]);const [loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{const raw=await AsyncStorage.getItem('mythos.user');const token=await AsyncStorage.getItem('mythos.accessToken');if(!raw){router.replace('/login');return;}const u=JSON.parse(raw);setUser(u);const [a,b]=await Promise.all([api<any>({action:'users',gmail:u.gmail},token||undefined),api<any>({action:'audit',gmail:u.gmail},token||undefined)]);if(a.ok)setUsers(a.data.records||[]);if(b.ok)setAudit(b.data.records||[]);setLoading(false)})()},[]);
 return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.container}><Text style={styles.back} onPress={()=>router.back()}>‹ Voltar</Text><Text style={styles.title}>Administração</Text><Text style={styles.muted}>{user?.nome} • {user?.cargo}</Text>{loading?<ActivityIndicator/>:<><Text style={styles.section}>Usuários</Text>{users.map((x,i)=><View style={styles.card} key={x.id||i}><Text style={styles.heading}>{x.nome}</Text><Text style={styles.muted}>{x.gmail} • {x.cargo} • {x.status}</Text></View>)}<Text style={styles.section}>Auditoria</Text>{audit.slice(-30).reverse().map((x,i)=><View style={styles.card} key={x.id||i}><Text style={styles.heading}>{x.acao}</Text><Text style={styles.muted}>{x.gmail} • {String(x.data_hora)}</Text><Text style={styles.body}>{x.detalhes}</Text></View>)}</>}</ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:'#08090d'},container:{padding:22,gap:12},back:{color:'#a98cff',fontSize:15},title:{color:'#fff',fontSize:34,fontWeight:'800'},section:{color:'#a98cff',fontSize:12,fontWeight:'800',letterSpacing:2,marginTop:10},muted:{color:'#8f95a8',fontSize:13},card:{backgroundColor:'#11131a',borderRadius:18,padding:16,gap:6,borderWidth:1,borderColor:'#222532'},heading:{color:'#fff',fontSize:16,fontWeight:'700'},body:{color:'#d9dbe2',fontSize:12}});
