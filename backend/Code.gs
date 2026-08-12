const SHEETS = ['USUARIOS','PONTO','RELATORIOS','EQUIPES','AUDITORIA'];

function setup() {
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  const headers={USUARIOS:['id','nome','gmail','cargo','equipe','status','criado_em'],PONTO:['id','gmail','nome','cargo','data','entrada','inicio_intervalo','retorno','saida','minutos_trabalhados','meta_minutos','status'],RELATORIOS:['id','data','autor_gmail','autor_nome','cargo','equipe','tipo','relatorio','status','enviado_em'],EQUIPES:['id','nome','lider_gmail','manager_gmail','staff_gmail','status'],AUDITORIA:['id','gmail','acao','entidade','entidade_id','data_hora','detalhes']};
  Object.keys(headers).forEach(name=>{let sh=ss.getSheetByName(name)||ss.insertSheet(name);if(sh.getLastRow()===0)sh.appendRow(headers[name]);});
  return {ok:true,sheets:SHEETS};
}
function doGet(){return json({ok:true,service:'MYTHØS Ponto API',version:'1.1'});}
function doPost(e){try{return json(route(JSON.parse(e.postData.contents||'{}')))}catch(err){return json({ok:false,error:String(err)})}}
function route(b){if(!b.action)return {ok:false,error:'action obrigatória'};if(b.action==='setup')return setup();if(b.action==='user')return getUser(b.gmail,b.accessToken);if(b.action==='punch')return punch(b);if(b.action==='today')return today(b.gmail);if(b.action==='report')return report(b);if(b.action==='reports')return reports(b);if(b.action==='users')return users(b);return {ok:false,error:'ação desconhecida'};}
function sheet(n){return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(n)}
function rows(n){const sh=sheet(n),v=sh.getDataRange().getValues();if(v.length<2)return[];return v.slice(1).map(r=>{const o={};v[0].forEach((h,i)=>o[h]=r[i]);return o})}
function id(){return Utilities.getUuid()}
function json(x){return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON)}
function verifyGoogleToken(accessToken){if(!accessToken)return null;try{const res=UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?access_token='+encodeURIComponent(accessToken),{muteHttpExceptions:true});if(res.getResponseCode()!==200)return null;const x=JSON.parse(res.getContentText());return x.email||null}catch(e){return null}}
function getUser(gmail,accessToken){const verified=verifyGoogleToken(accessToken);if(!verified||String(verified).toLowerCase()!==String(gmail||'').toLowerCase())return {ok:false,error:'Identidade Google não validada'};const u=rows('USUARIOS').find(x=>String(x.gmail).toLowerCase()===String(verified).toLowerCase()&&String(x.status).toLowerCase()!=='inativo');if(!u)return {ok:false,error:'Usuário não autorizado'};return {ok:true,user:u}}
function authorized(gmail){return rows('USUARIOS').find(x=>String(x.gmail).toLowerCase()===String(gmail||'').toLowerCase()&&String(x.status).toLowerCase()!=='inativo')}
function punch(b){const u=authorized(b.gmail);if(!u)return {ok:false,error:'Usuário não autorizado'};sheet('PONTO').appendRow([id(),u.gmail,u.nome,u.cargo,b.data||new Date(),b.entrada||'',b.inicio_intervalo||'',b.retorno||'',b.saida||'',b.minutos_trabalhados||0,b.meta_minutos||0,b.status||'PENDENTE']);audit(b.gmail,'REGISTRAR_PONTO','PONTO','',JSON.stringify(b));return {ok:true}}
function today(gmail){const u=authorized(gmail);if(!u)return {ok:false,error:'Usuário não autorizado'};const tz=Session.getScriptTimeZone(),d=Utilities.formatDate(new Date(),tz,'yyyy-MM-dd');return {ok:true,user:u,records:rows('PONTO').filter(x=>String(x.gmail).toLowerCase()===String(gmail).toLowerCase()&&String(x.data).indexOf(d)>=0)}}
function report(b){const u=authorized(b.gmail);if(!u)return {ok:false,error:'Usuário não autorizado'};if(!['Owner','Staff','ALL','Manager','Líder'].includes(String(u.cargo)))return {ok:false,error:'Sem permissão para relatórios'};sheet('RELATORIOS').appendRow([id(),new Date(),u.gmail,u.nome,u.cargo,b.equipe||u.equipe||'',b.tipo||'Geral',b.relatorio||'','ENVIADO',new Date()]);audit(b.gmail,'ENVIAR_RELATORIO','RELATORIO','',b.relatorio||'');return {ok:true}}
function reports(b){const u=authorized(b.gmail);if(!u)return {ok:false,error:'Usuário não autorizado'};if(!['Owner','Staff','ALL','Manager','Líder'].includes(String(u.cargo)))return {ok:false,error:'Sem permissão'};return {ok:true,records:rows('RELATORIOS')}}
function users(b){const u=authorized(b.gmail);if(!u)return {ok:false,error:'Usuário não autorizado'};if(!['Owner','Staff','ALL'].includes(String(u.cargo)))return {ok:false,error:'Sem permissão'};return {ok:true,records:rows('USUARIOS')}}
function audit(gmail,acao,entidade,entidadeId,detalhes){sheet('AUDITORIA').appendRow([id(),gmail,acao,entidade,entidadeId,new Date(),detalhes])}
