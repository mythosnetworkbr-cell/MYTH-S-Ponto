import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const roles = ['Owner', 'Staff', 'ALL', 'Manager', 'Líder', 'Admin²', 'Auxiliar', 'Funcionário'] as const;
type Role = typeof roles[number];

type Punch = { type: string; at: number };

const seniorRoles: Role[] = ['Owner', 'Staff', 'ALL', 'Manager', 'Líder'];
const targetFor = (role: Role) => seniorRoles.includes(role) ? 3 * 60 : 2 * 60;

function formatMinutes(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h ${String(m).padStart(2, '0')}min`;
}

function workedMinutes(punches: Punch[]) {
  let total = 0;
  let start: number | null = null;
  for (const p of punches) {
    if (p.type === 'Entrada' || p.type === 'Retorno do intervalo') start = p.at;
    if ((p.type === 'Início do intervalo' || p.type === 'Saída') && start !== null) {
      total += Math.max(0, Math.round((p.at - start) / 60000));
      start = null;
    }
  }
  if (start !== null) total += Math.max(0, Math.round((Date.now() - start) / 60000));
  return total;
}

export default function Home() {
  const [role, setRole] = useState<Role>('Funcionário');
  const [punches, setPunches] = useState<Punch[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('mythos.role'),
      AsyncStorage.getItem('mythos.punches'),
    ]).then(([savedRole, savedPunches]) => {
      if (roles.includes(savedRole as Role)) setRole(savedRole as Role);
      if (savedPunches) setPunches(JSON.parse(savedPunches));
    });
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const todayPunches = useMemo(() => {
    const today = new Date().toDateString();
    return punches.filter(p => new Date(p.at).toDateString() === today);
  }, [punches, now]);

  const worked = useMemo(() => workedMinutes(todayPunches), [todayPunches, now]);
  const target = targetFor(role);
  const remaining = Math.max(0, target - worked);
  const completed = worked >= target;
  const fullAccess = role === 'Owner' || role === 'Staff';
  const management = fullAccess || role === 'ALL' || role === 'Manager' || role === 'Líder';

  const register = async (type: string) => {
    const next = [...punches, { type, at: Date.now() }];
    setPunches(next);
    await AsyncStorage.setItem('mythos.punches', JSON.stringify(next));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.brand}>MYTHØS</Text>
        <Text style={styles.title}>Ponto</Text>

        <View style={styles.card}>
          <Text style={styles.label}>PERFIL</Text>
          <Text style={styles.role}>{role}</Text>
          <Text style={styles.muted}>Meta diária obrigatória: {target / 60} horas</Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <View><Text style={styles.label}>HOJE</Text><Text style={styles.hours}>{formatMinutes(worked)}</Text></View>
            <View style={styles.status}><Text style={styles.statusText}>{completed ? 'META CUMPRIDA' : 'PENDENTE'}</Text></View>
          </View>
          <View style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, (worked / target) * 100)}%` }]} /></View>
          <Text style={styles.muted}>{completed ? 'Parabéns! Meta diária atingida.' : `Faltam ${formatMinutes(remaining)} para cumprir a meta.`}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>REGISTRAR PONTO</Text>
          <Pressable style={styles.primary} onPress={() => register('Entrada')}><Text style={styles.buttonText}>ENTRADA</Text></Pressable>
          <View style={styles.row}>
            <Pressable style={styles.secondary} onPress={() => register('Início do intervalo')}><Text style={styles.buttonText}>INTERVALO</Text></Pressable>
            <Pressable style={styles.secondary} onPress={() => register('Retorno do intervalo')}><Text style={styles.buttonText}>RETORNO</Text></Pressable>
          </View>
          <Pressable style={styles.exit} onPress={() => register('Saída')}><Text style={styles.buttonText}>SAÍDA</Text></Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>REGISTROS DE HOJE</Text>
          {todayPunches.length === 0 ? <Text style={styles.muted}>Nenhum registro hoje.</Text> : todayPunches.map((p, i) => (
            <View style={styles.record} key={`${p.at}-${i}`}>
              <Text style={styles.recordType}>{p.type}</Text>
              <Text style={styles.muted}>{new Date(p.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          ))}
        </View>

        <View style={styles.grid}>
          <View style={styles.smallCard}><Text style={styles.icon}>◷</Text><Text style={styles.smallTitle}>Meu ponto</Text><Text style={styles.muted}>Histórico pessoal</Text></View>
          {management && <View style={styles.smallCard}><Text style={styles.icon}>▤</Text><Text style={styles.smallTitle}>Relatórios</Text><Text style={styles.muted}>Gestão de equipes</Text></View>}
          {fullAccess && <View style={styles.smallCard}><Text style={styles.icon}>⚙</Text><Text style={styles.smallTitle}>Administração</Text><Text style={styles.muted}>Controle total</Text></View>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#08090d' },
  container: { padding: 22, gap: 16 },
  brand: { color: '#9b7cff', fontSize: 14, fontWeight: '800', letterSpacing: 3 },
  title: { color: '#fff', fontSize: 38, fontWeight: '800' },
  card: { backgroundColor: '#11131a', borderRadius: 20, padding: 20, gap: 12, borderWidth: 1, borderColor: '#222532' },
  progressCard: { backgroundColor: '#171522', borderRadius: 20, padding: 20, gap: 14, borderWidth: 1, borderColor: '#4a3a72' },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#8f95a8', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  role: { color: '#fff', fontSize: 24, fontWeight: '700' },
  hours: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 3 },
  muted: { color: '#8f95a8', fontSize: 13 },
  status: { backgroundColor: '#262033', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  statusText: { color: '#c3a9ff', fontSize: 10, fontWeight: '800' },
  track: { height: 10, backgroundColor: '#292432', borderRadius: 10, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#9b7cff', borderRadius: 10 },
  primary: { backgroundColor: '#8b5cf6', borderRadius: 14, padding: 17, alignItems: 'center' },
  secondary: { flex: 1, backgroundColor: '#20232d', borderRadius: 14, padding: 16, alignItems: 'center' },
  exit: { backgroundColor: '#3a2027', borderRadius: 14, padding: 17, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  row: { flexDirection: 'row', gap: 10 },
  record: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#222532' },
  recordType: { color: '#fff', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  smallCard: { backgroundColor: '#11131a', borderRadius: 18, padding: 17, minWidth: '46%', flexGrow: 1, borderWidth: 1, borderColor: '#222532', gap: 5 },
  icon: { color: '#9b7cff', fontSize: 22 },
  smallTitle: { color: '#fff', fontSize: 15, fontWeight: '700' }
});
