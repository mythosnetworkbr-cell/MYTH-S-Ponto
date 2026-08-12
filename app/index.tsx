import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const roles = ['Owner', 'Staff', 'ALL', 'Manager', 'Líder', 'Admin²', 'Auxiliar', 'Funcionário'] as const;
type Role = typeof roles[number];

const minimumHours: Record<Role, number> = {
  Owner: 3,
  Staff: 3,
  ALL: 3,
  Manager: 3,
  Líder: 3,
  'Admin²': 2,
  Auxiliar: 2,
  Funcionário: 2,
};

export default function Home() {
  const [role, setRole] = useState<Role>('Funcionário');
  const [lastAction, setLastAction] = useState('Nenhum registro hoje');
  const requiredHours = minimumHours[role];

  useEffect(() => {
    AsyncStorage.getItem('mythos.role').then(value => {
      if (roles.includes(value as Role)) setRole(value as Role);
    });
    AsyncStorage.getItem('mythos.lastPunch').then(value => {
      if (value) setLastAction(value);
    });
  }, []);

  const register = async (action: string) => {
    const timestamp = new Date().toLocaleString('pt-BR');
    const entry = `${action} • ${timestamp}`;
    setLastAction(entry);
    await AsyncStorage.setItem('mythos.lastPunch', entry);
  };

  const fullAccess = role === 'Owner' || role === 'Staff';
  const management = fullAccess || role === 'ALL' || role === 'Manager' || role === 'Líder';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.brand}>MYTHØS</Text>
        <Text style={styles.title}>Ponto</Text>
        <View style={styles.card}>
          <Text style={styles.label}>PERFIL</Text>
          <Text style={styles.role}>{role}</Text>
          <Text style={styles.muted}>{management ? 'Acesso de gestão habilitado' : 'Registro pessoal de ponto'}</Text>
          <View style={styles.requirement}>
            <Text style={styles.requirementTitle}>META DIÁRIA OBRIGATÓRIA</Text>
            <Text style={styles.requirementHours}>{requiredHours}h</Text>
            <Text style={styles.muted}>Tempo mínimo de ponto por dia para este cargo</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>REGISTRAR PONTO</Text>
          <Pressable style={styles.primary} onPress={() => register('Entrada')}><Text style={styles.buttonText}>ENTRADA</Text></Pressable>
          <View style={styles.row}>
            <Pressable style={styles.secondary} onPress={() => register('Início do intervalo')}><Text style={styles.buttonText}>INTERVALO</Text></Pressable>
            <Pressable style={styles.secondary} onPress={() => register('Retorno do intervalo')}><Text style={styles.buttonText}>RETORNO</Text></Pressable>
          </View>
          <Pressable style={styles.exit} onPress={() => register('Saída')}><Text style={styles.buttonText}>SAÍDA</Text></Pressable>
          <Text style={styles.last}>{lastAction}</Text>
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
  label: { color: '#8f95a8', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  role: { color: '#fff', fontSize: 24, fontWeight: '700' },
  muted: { color: '#8f95a8', fontSize: 13 },
  requirement: { marginTop: 4, backgroundColor: '#191523', borderRadius: 15, padding: 15, borderWidth: 1, borderColor: '#32254f' },
  requirementTitle: { color: '#a78bfa', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  requirementHours: { color: '#fff', fontSize: 30, fontWeight: '800', marginVertical: 2 },
  primary: { backgroundColor: '#8b5cf6', borderRadius: 14, padding: 17, alignItems: 'center' },
  secondary: { flex: 1, backgroundColor: '#20232d', borderRadius: 14, padding: 16, alignItems: 'center' },
  exit: { backgroundColor: '#3a2027', borderRadius: 14, padding: 17, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  row: { flexDirection: 'row', gap: 10 },
  last: { color: '#b8bdcc', fontSize: 12, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  smallCard: { backgroundColor: '#11131a', borderRadius: 18, padding: 17, minWidth: '46%', flexGrow: 1, borderWidth: 1, borderColor: '#222532', gap: 5 },
  icon: { color: '#9b7cff', fontSize: 22 },
  smallTitle: { color: '#fff', fontSize: 15, fontWeight: '700' }
});
