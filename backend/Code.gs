const SHEETS = ['USUARIOS','PONTO','RELATORIOS','EQUIPES','AUDITORIA'];

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const headers = {
    USUARIOS: ['id','nome','gmail','cargo','equipe','status','criado_em'],
    PONTO: ['id','gmail','nome','cargo','data','entrada','inicio_intervalo','retorno','saida','minutos_trabalhados','meta_minutos','status'],
    RELATORIOS: ['id','data','autor_gmail','autor_nome','cargo','equipe','tipo','relatorio','status','enviado_em'],
    EQUIPES: ['id','nome','lider_gmail','manager_gmail','staff_gmail','status'],
    AUDITORIA: ['id','gmail','acao','entidade','entidade_id','data_hora','detalhes']
  };
  Object.keys(headers).forEach(name => {
    let sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sh.getLastRow() === 0) sh.appendRow(headers[name]);
  });
  return { ok: true, sheets: SHEETS };
}

function doGet(e) { return json({ ok: true, service: 'MYTHØS Ponto API', version: '1.0' }); }
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    return json(route(body));
  } catch (err) { return json({ ok:false, error:String(err) }); }
}

function route(b) {
  if (!b.action) return { ok:false, error:'action obrigatória' };
  if (b.action === 'setup') return setup();
  if (b.action === 'user') return getUser(b.gmail);
  if (b.action === 'punch') return punch(b);
  if (b.action === 'today') return today(b.gmail);
  if (b.action === 'report') return report(b);
  if (b.action === 'reports') return reports(b);
  if (b.action === 'users') return users(b);
  return { ok:false, error:'ação desconhecida' };
}

function sheet(name) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name); }
function rows(name) { const sh=sheet(name); const values=sh.getDataRange().getValues(); if(values.length<2)return[]; return values.slice(1).map(r=>{const o={}; values[0].forEach((h,i)=>o[h]=r[i]); return o;}); }
function id(){ return Utilities.getUuid(); }
function json(x){ return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON); }

function getUser(gmail){
  const u=rows('USUARIOS').find(x=>String(x.gmail).toLowerCase()===String(gmail||'').toLowerCase() && String(x.status).toLowerCase()!=='inativo');
  if(!u)return {ok:false,error:'Usuário não autorizado'};
  return {ok:true,user:u};
}

function punch(b){
  const u=getUser(b.gmail); if(!u.ok)return u;
  const sh=sheet('PONTO');
  sh.appendRow([id(),u.user.gmail,u.user.nome,u.user.cargo,b.data||new Date(),b.entrada||'',b.inicio_intervalo||'',b.retorno||'',b.saida||'',b.minutos_trabalhados||0,b.meta_minutos||0,b.status||'PENDENTE']);
  audit(b.gmail,'REGISTRAR_PONTO','PONTO','',JSON.stringify(b));
  return {ok:true};
}

function today(gmail){
  const u=getUser(gmail); if(!u.ok)return u;
  const tz=Session.getScriptTimeZone(); const d=Utilities.formatDate(new Date(),tz,'yyyy-MM-dd');
  const data=rows('PONTO').filter(x=>String(x.gmail).toLowerCase()===String(gmail).toLowerCase() && String(x.data).indexOf(d)>=0);
  return {ok:true,user:u.user,records:data};
}

function report(b){
  const u=getUser(b.gmail); if(!u.ok)return u;
  const allowed=['Owner','Staff','ALL','Manager','Líder'];
  if(!allowed.includes(String(u.user.cargo)))return {ok:false,error:'Sem permissão para relatórios'};
  const sh=sheet('RELATORIOS'); sh.appendRow([id(),new Date(),u.user.gmail,u.user.nome,u.user.cargo,b.equipe||u.user.equipe||'',b.tipo||'Geral',b.relatorio||'', 'ENVIADO',new Date()]);
  audit(b.gmail,'ENVIAR_RELATORIO','RELATORIO','',b.relatorio||''); return {ok:true};
}
function reports(b){
  const u=getUser(b.gmail); if(!u.ok)return u;
  const allowed=['Owner','Staff','ALL','Manager','Líder']; if(!allowed.includes(String(u.user.cargo)))return {ok:false,error:'Sem permissão'};
  return {ok:true,records:rows('RELATORIOS')};
}
function users(b){
  const u=getUser(b.gmail); if(!u.ok)return u;
  const allowed=['Owner','Staff','ALL']; if(!allowed.includes(String(u.user.cargo)))return {ok:false,error:'Sem permissão'};
  return {ok:true,records:rows('USUARIOS')};
}
function audit(gmail,acao,entidade,entidadeId,detalhes){ sheet('AUDITORIA').appendRow([id(),gmail,acao,entidade,entidadeId,new Date(),detalhes]); }
