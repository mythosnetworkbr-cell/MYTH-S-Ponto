import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../src/api/mythosApi';
import { nextActionFor, stateFor, workedMinutes } from '../src/attendance/rules';
import type { Punch, PunchType } from '../src/attendance/types';

const roles = ['Owner', 'Staff', 'ALL', 'Manager', 'Líder', 'Admin²', 'Auxiliar', 'Funcionário'] as const;
type Role = typeof roles[number];
const seniorRoles: Role[] = ['Owner', 'Staff', 'ALL', 'Manager', 'Líder'];
const targetFor = (role: Role) => seniorRoles.includes(role) ? 180 : 120;
const formatMinutes = (t:number) => `${Math.floor(t/60)}h ${String(t%60).padStart(2,'0')}min`;

export default function Home() {
  const [user,setUser]=useState<any>(null);
  const [punches,setPunches]=useState<Punch[]>([]);
  const [now,setNow]=useState(Date.now());
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');

  async function load(){
    const [u,token]=await Promise.all([AsyncStorage.getItem('mythos.user'),AsyncStorage.getItem('mythos.accessToken')]);
    if(!u)return;
    const parsed=JSON.parse(u); setUser(parsed);
    const result=await api<any>({action:'today',gmail:parsed.gmail},token||undefined);
    if(result.ok){
      const remote=(result.data.records||[]).map((r:any)=>({id:String(r.id),type:r.tipo as PunchType,at:new Date(r.timestamp).getTime()}));
      setPunches(remote); await AsyncStorage.setItem('mythos.punches',JSON.stringify(remote));
    } else {
      const local=await AsyncStorage.getItem('mythos.punches'); if(local)setPunches(JSON.parse(local));
    }
  }
  useEffect(()=>{load();const t=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(t)},[]);
  if(!user)return <Redirect href="/login"/>;
  const role:Role=roles.includes(user.cargo)?user.cargo:'Funcionário';
  const today=punches.filter(p=>new Date(p.at).toDateString()===new Date().toDateString());
  const worked=workedMinutes(today,now), target=targetFor(role), completed=worked>=target;
  const next=nextActionFor(today), state=stateFor(today);
  const management=seniorRoles.includes(role), full=['Owner','Staff'].includes(role);

  const register=async(type:PunchType)=>{
    if(busy)return;
    if(next!==type){Alert.alert('MYTHØS Ponto',next?`A próxima ação é ${next}.`:'A jornada de hoje já foi encerrada.');return;}
    const token=await AsyncStorage.getItem('mythos.accessToken'); setBusy(true); setMessage('Sincronizando…');
    const result=await api<any>({action:'punch',gmail:user.gmail,tipo:type},token||undefined);
    setBusy(false);
    if(!result.ok){Alert.alert('Não foi possível registrar',result.error);setMessage('');return;}
    const record:Punch={id:String(result.data.record.id||`${Date.now()}`),type,at:new Date(result.data.record.timestamp).getTime()};
    const updated=[...today,record]; setPunches(updated); await AsyncStorage.setItem('mythos.punches',JSON.stringify(updated)); setMessage('Ponto sincronizado com sucesso.'); setNow(Date.now());
  };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.container}><Text style={styles.brand}>MYTHØS</Text><Text style={styles.title}>Ponto</Text>
    <View style={styles.card}><Text style={styles.label}>OLÁ</Text><Text style={styles.role}>{user.nome||'Usuário'}</Text><Text style={styles.muted}>{role} • Meta diária {target/60} horas</Text></View>
    <View style={styles.progressCard}><View style={styles.progressTop}><View><Text style={styles.label}>HOJE</Text><Text style={styles.hours}>{formatMinutes(worked)}</Text></View><View style={styles.status}><Text style={styles.statusText}>{completed?'META CUMPRIDA':state==='FINISHED'?'ENCERRADO':'EM ANDAMENTO'}</Text></View></View><View style={styles.track}><View style={[styles.fill,{width:`${Math.min(100,worked/target*100)}%`}]} /></View><Text style={styles.muted}>{completed?'Meta diária atingida.':`Faltam ${formatMinutes(Math.max(0,target-worked))}.`}</Text></View>
    <View style={styles.card}><Text style={styles.label}>REGISTRAR PONTO</Text><Pressable style={[styles.primary,(next!=='Entrada'||busy)&&styles.disabled]} onPress={()=>register('Entrada')} disabled={next!=='Entrada'||busy}><Text style={styles.buttonText}>ENTRADA</Text></Pressable><View style={styles.row}><Pressable style={[styles.secondary,(next!=='Início do intervalo'||busy)&&styles.disabled]} onPress={()=>register('Início do intervalo')} disabled={next!=='Início do intervalo'||busy}><Text style={styles.buttonText}>INTERVALO</Text></Pressable><Pressable style={[styles.secondary,(next!=='Retorno do intervalo'||busy)&&styles.disabled]} onPress={()=>register('Retorno do intervalo')} disabled={next!=='Retorno do intervalo'||busy}><Text style={styles.buttonText}>RETORNO</Text></Pressable></View><Pressable style={[styles.exit,(next!=='Saída'||busy)&&styles.disabled]} onPress={()=>register('Saída')} disabled={next!=='Saída'||busy}><Text style={styles.buttonText}>SAÍDA</Text></Pressable><Text style={styles.muted}>{message||`Próxima ação: ${next||'jornada encerrada'}`}</Text></View>
    <View style={styles.card}><Text style={styles.label}>REGISTROS DE HOJE</Text>{today.length?today.map((p,i)=><View style={styles.record} key={`${p.id}-${i}`}><Text style={styles.recordType}>{p.type}</Text><Text style={styles.muted}>{new Date(p.at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</Text></View>):<Text style={styles.muted}>Nenhum registro hoje.</Text>}</View>
    <View style={styles.grid}><View style={styles.smallCard}><Text style={styles.icon}>◷</Text><Text style={styles.smallTitle}>Meu ponto</Text><Text style={styles.muted}>Histórico pessoal</Text></View>{management&&<View style={styles.smallCard}><Text style={styles.icon}>▤</Text><Text style={styles.smallTitle}>Relatórios</Text><Text style={styles.muted}>Equipe e gestão</Text></View>}{full&&<View style={styles.smallCard}><Text style={styles.icon}>⚙</Text><Text style={styles.smallTitle}>Administração</Text><Text style={styles.muted}>Acesso total</Text></View>}</View>
  </ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:'#08090d'},container:{padding:22,gap:16},brand:{color:'#9b7cff',fontSize:14,fontWeight:'800',letterSpacing:3},title:{color:'#fff',fontSize:38,fontWeight:'800'},card:{backgroundColor:'#11131a',borderRadius:20,padding:20,gap:12,borderWidth:1,borderColor:'#222532'},progressCard:{backgroundColor:'#171522',borderRadius:20,padding:20,gap:14,borderWidth:1,borderColor:'#4a3a72'},progressTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},label:{color:'#8f95a8',fontSize:11,fontWeight:'800',letterSpacing:1.5},role:{color:'#fff',fontSize:24,fontWeight:'700'},hours:{color:'#fff',fontSize:32,fontWeight:'800',marginTop:3},muted:{color:'#8f95a8',fontSize:13},status:{backgroundColor:'#262033',borderRadius:10,paddingHorizontal:10,paddingVertical:7},statusText:{color:'#c3a9ff',fontSize:10,fontWeight:'800'},track:{height:10,backgroundColor:'#292432',borderRadius:10,overflow:'hidden'},fill:{height:'100%',backgroundColor:'#9b7cff',borderRadius:10},primary:{backgroundColor:'#8b5cf6',borderRadius:14,padding:17,alignItems:'center'},secondary:{flex:1,backgroundColor:'#20232d',borderRadius:14,padding:16,alignItems:'center'},exit:{backgroundColor:'#3a2027',borderRadius:14,padding:17,alignItems:'center'},disabled:{opacity:.35},buttonText:{color:'#fff',fontWeight:'800',fontSize:13},row:{flexDirection:'row',gap:10},record:{flexDirection:'row',justifyContent:'space-between',paddingVertical:9,borderBottomWidth:1,borderBottomColor:'#222532'},recordType:{color:'#fff',fontWeight:'600'},grid:{flexDirection:'row',flexWrap:'wrap',gap:12},smallCard:{backgroundColor:'#11131a',borderRadius:18,padding:17,minWidth:'46%',flexGrow:1,borderWidth:1,borderColor:'#222532',gap:5},icon:{color:'#9b7cff',fontSize:22},smallTitle:{color:'#fff',fontSize:15,fontWeight:'700'}});
