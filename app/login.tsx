import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const continueWithGoogle = async () => {
    setLoading(true);
    // OAuth real será ligado ao Google Cloud/Firebase quando o Client ID estiver configurado.
    setTimeout(() => { setLoading(false); router.replace('/'); }, 700);
  };
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.logo}><Text style={styles.mark}>M</Text></View>
        <Text style={styles.brand}>MYTHØS</Text>
        <Text style={styles.product}>PONTO</Text>
        <Text style={styles.tagline}>DISCIPLINA • FOCO • RESULTADOS</Text>
        <View style={styles.card}>
          <Text style={styles.title}>Bem-vindo</Text>
          <Text style={styles.subtitle}>Entre com sua conta Google para acessar o MYTHØS Ponto.</Text>
          <Pressable style={styles.google} onPress={continueWithGoogle} disabled={loading}>
            <Text style={styles.googleG}>G</Text><Text style={styles.googleText}>{loading ? 'Conectando…' : 'Continuar com o Google'}</Text>
          </Pressable>
          <View style={styles.secure}><Text style={styles.dot}>✓</Text><Text style={styles.secureText}>Acesso protegido por autenticação Google</Text></View>
          <View style={styles.secure}><Text style={styles.dot}>✓</Text><Text style={styles.secureText}>Seu perfil e permissões ficam vinculados à conta</Text></View>
        </View>
        <Text style={styles.footer}>MYTHØS NETWORK</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#050812'}, container:{flex:1,justifyContent:'center',padding:28,alignItems:'center'},
  logo:{width:116,height:116,borderRadius:34,backgroundColor:'#0b1425',borderWidth:1,borderColor:'#3f8cff',alignItems:'center',justifyContent:'center',shadowColor:'#28a8ff',shadowOpacity:.35,shadowRadius:24},
  mark:{fontSize:72,fontWeight:'900',fontStyle:'italic',color:'#69c9ff'}, brand:{marginTop:20,color:'#fff',fontSize:34,fontWeight:'900',letterSpacing:4}, product:{color:'#63cfff',fontSize:18,fontWeight:'800',letterSpacing:7,marginTop:2},
  tagline:{color:'#7d879b',fontSize:10,fontWeight:'700',letterSpacing:2,marginTop:10}, card:{width:'100%',marginTop:42,padding:24,borderRadius:24,backgroundColor:'#0d1220',borderWidth:1,borderColor:'#1e2a40'},
  title:{color:'#fff',fontSize:25,fontWeight:'800'}, subtitle:{color:'#8e98aa',fontSize:14,lineHeight:21,marginTop:8,marginBottom:22},
  google:{height:56,borderRadius:15,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',flexDirection:'row',gap:12}, googleG:{fontSize:22,fontWeight:'900',color:'#4285F4'}, googleText:{fontSize:15,fontWeight:'800',color:'#16181d'},
  secure:{flexDirection:'row',alignItems:'center',gap:9,marginTop:15},dot:{color:'#52d6a1',fontWeight:'900'},secureText:{color:'#697489',fontSize:12,flex:1},footer:{position:'absolute',bottom:30,color:'#4e596c',fontSize:10,fontWeight:'800',letterSpacing:3}
});
