const SHEETS=['USUARIOS','PONTO','RELATORIOS','EQUIPES','AUDITORIA'];
const SENIOR_ROLES=['Owner','Staff','ALL','Manager','Líder'];
const ADMIN_ROLES=['Owner','Staff','ALL'];
const HEADERS={USUARIOS:['id','nome','gmail','cargo','equipe','status','criado_em'],PONTO:['id','gmail','nome','cargo','data','tipo','timestamp','minutos_trabalhados','meta_minutos','status'],RELATORIOS:['id','data','autor_gmail','autor_nome','cargo','equipe','tipo','relatorio','status','enviado_em'],EQUIPES:['id','nome','lider_gmail','manager_gmail','staff_gmail','status'],AUDITORIA:['id','gmail','acao','entidade','entidade_id','data_hora','detalhes']};
function setup(){const ss=SpreadsheetApp.getActiveSpreadsheet();Object.keys(HEADERS).forEach(n=>{const sh=ss.getSheetByName(n)||ss.insertSheet(n);if(sh.getLastRow()===0)sh.appendRow(HEADERS[n]);});return{ok:true,sheets:SHEETS};}
function doGet(){return json({ok:true,service:'MYTHØS Ponto API',version:'2.1'});}
function doPost(e){try{return json(route(JSON.parse(e.postData.contents||'{}')))}catch(err){return json({ok:false,error:String(err)})}}
function route(b){if(!b.action)return{ok:false,error:'action obrigatória'};if(b.action==='setup')return setup();if(b.action==='user')return getUser(b.gmail,b.accessToken);if(b.action==='punch')return punch(b);if(b.action==='today')return today(b.gmail,b.accessToken);if(b.action==='report')return report(b);if(b.action==='reports')return reports(b);if(b.action==='users')return users(b);if(b.action==='teams')return teams(b);if(b.action==='audit')return auditRecords(b);return{ok:false,error:'ação desconhecida'}}
function sheet(n){return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(n)}
function rows(n){const sh=sheet(n);if(!sh)return[];const v=sh.getDataRange().getValues();if(v.length<2)return[];return v.slice(1).map(r=>{const o={};v[0].forEach((h,i)=>o[h]=r[i]);return o})}
function id(){return Utilities.getUuid()}
function json(x){return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON)}
function verifyGoogleToken(accessToken){if(!accessToken)return null;try{const res=UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?access_token='+encodeURIComponent(accessToken),{muteHttpExceptions:true});if(res.getResponseCode()!==200)return null;return JSON.parse(res.getContentText()).email||null}catch(e){return null}}
function identity(gmail,accessToken){const verified=verifyGoogleToken(accessToken);if(!verified||String(verified).toLowerCase()!==String(gmail||'').toLowerCase())return null;return authorized(verified)}
function getUser(gmail,accessToken){const u=identity(gmail,accessToken);return u?{ok:true,user:u}:{ok:false,error:'Identidade Google não validada ou usuário não autorizado'}}
function authorized(gmail){return rows('USUARIOS').find(x=>String(x.gmail).toLowerCase()===String(gmail||'').toLowerCase()&&String(x.status).toLowerCase()!=='inativo')}
function today(gmail,accessToken){const u=identity(gmail,accessToken);if(!u)return{ok:false,error:'Não autorizado'};const tz=Session.getScriptTimeZone(),d=Utilities.formatDate(new Date(),tz,'yyyy-MM-dd');return{ok:true,user:u,records:rows('PONTO').filter(x=>String(x.gmail).toLowerCase()===String(u.gmail).toLowerCase()&&String(x.data)===d)}}
function punch(b){const lock=LockService.getScriptLock();lock.waitLock(10000);try{return punchLocked(b)}finally{lock.releaseLock()}}
function punchLocked(b){
 const u=identity(b.gmail,b.accessToken);if(!u)return{ok:false,error:'Identidade Google não validada'};
 const allowed=['Entrada','Início do intervalo','Retorno do intervalo','Saída'];if(!allowed.includes(b.tipo))return{ok:false,error:'Tipo de ponto inválido'};
 const tz=Session.getScriptTimeZone(),now=new Date(),day=Utilities.formatDate(now,tz,'yyyy-MM-dd');
 const existing=rows('PONTO').filter(x=>String(x.gmail).toLowerCase()===String(u.gmail).toLowerCase()&&String(x.data)===day);
 const last=existing[existing.length-1];const expected=!last?'Entrada':last.tipo==='Entrada'||last.tipo==='Retorno do intervalo'?'Início do intervalo':last.tipo==='Início do intervalo'?'Retorno do intervalo':null;
 if(last&&last.tipo==='Saída')return{ok:false,error:'Jornada já encerrada hoje'};
 if(b.tipo!==expected)return{ok:false,error:'Sequência inválida. Próxima ação: '+(expected||'nenhuma')};
 let minutes=0,start=null;existing.forEach(x=>{if(x.tipo==='Entrada'||x.tipo==='Retorno do intervalo')start=new Date(x.timestamp);if((x.tipo==='Início do intervalo'||x.tipo==='Saída')&&start){minutes+=Math.max(0,Math.round((new Date(x.timestamp)-start)/60000));start=null;}});if(b.tipo==='Saída'&&start)minutes+=Math.max(0,Math.round((now-start)/60000));
 const recordId=id(),target=SENIOR_ROLES.includes(String(u.cargo))?180:120;sheet('PONTO').appendRow([recordId,u.gmail,u.nome,u.cargo,day,b.tipo,now,minutes,target,b.tipo==='Saída'?'CONCLUIDO':'EM_ANDAMENTO']);audit(u.gmail,'REGISTRAR_PONTO','PONTO',recordId,b.tipo);
 return{ok:true,record:{id:recordId,tipo:b.tipo,timestamp:now.toISOString(),workedMinutes:minutes,targetMinutes:target}};
}
function report(b){const u=identity(b.gmail,b.accessToken);if(!u)return{ok:false,error:'Não autorizado'};if(!SENIOR_ROLES.includes(String(u.cargo)))return{ok:false,error:'Sem permissão para relatórios'};const rid=id();sheet('RELATORIOS').appendRow([rid,new Date(),u.gmail,u.nome,u.cargo,b.equipe||u.equipe||'',b.tipo||'Geral',b.relatorio||'','ENVIADO',new Date()]);audit(u.gmail,'ENVIAR_RELATORIO','RELATORIO',rid,b.relatorio||'');return{ok:true,id:rid}}
function reports(b){const u=identity(b.gmail,b.accessToken);if(!u||!SENIOR_ROLES.includes(String(u.cargo)))return{ok:false,error:'Sem permissão'};return{ok:true,records:rows('RELATORIOS')}}
function users(b){const u=identity(b.gmail,b.accessToken);if(!u||!ADMIN_ROLES.includes(String(u.cargo)))return{ok:false,error:'Sem permissão'};return{ok:true,records:rows('USUARIOS')}}
function teams(b){const u=identity(b.gmail,b.accessToken);if(!u||!SENIOR_ROLES.includes(String(u.cargo)))return{ok:false,error:'Sem permissão'};return{ok:true,records:rows('EQUIPES')}}
function audit(gmail,acao,entidade,entidadeId,detalhes){sheet('AUDITORIA').appendRow([id(),gmail,acao,entidade,entidadeId,new Date(),detalhes])}
function auditRecords(b){const u=identity(b.gmail,b.accessToken);if(!u||!ADMIN_ROLES.includes(String(u.cargo)))return{ok:false,error:'Sem permissão'};return{ok:true,records:rows('AUDITORIA')}}
