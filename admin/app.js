const $ = (s) => document.querySelector(s);
const labels = {confirmed:'Confirmado no CRM',candidate:'Correspondência a conferir',unverified:'Sem confirmação',crm_only:'Somente no CRM'};
let csrf='', records=[], filtered=[], currentPage=0, authenticated=false;
const pageSize=30;
const dateFormat = new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Bahia'});
const formatDate = value => value && Number.isFinite(Date.parse(value)) ? dateFormat.format(new Date(value)) : 'Não disponível';
function notice(message='',error=false){ $('#notice').textContent=message; $('#notice').className=error?'error':'success'; }
function element(tag,text,className){const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;return el;}
async function api(action,{method='GET',data,query=''}={}){
 const response=await fetch(`/admin/api.php?action=${action}${query}`,{method,credentials:'same-origin',headers:method==='POST'?{'Content-Type':'application/json','X-CSRF-Token':csrf}:{},body:data?JSON.stringify(data):undefined});
 const result=await response.json();
 if(!response.ok){if(response.status===401&&action!=='login'){authenticated=false;renderRoute();}throw new Error(result.message||'Não foi possível concluir a consulta.');}
 if(result.csrf)csrf=result.csrf;return result;
}
function renderRoute(){
 const leads=location.hash==='#leads';
 $('#login').hidden=authenticated;$('#home').hidden=!authenticated||leads;$('#leads').hidden=!authenticated||!leads;$('#logout').hidden=!authenticated;
 $('[data-home]').classList.toggle('active',!leads);$('[data-leads]').classList.toggle('active',leads);
}
async function load(){
 const button=$('#refresh');button.disabled=true;notice('Consultando registros…');
 try{const result=await api('leads',{query:`&from=${encodeURIComponent($('#from').value)}&to=${encodeURIComponent($('#to').value)}`});records=result.records;
 document.querySelectorAll('[data-count]').forEach(el=>el.textContent=records.length);
 $('#stat-site').textContent=records.filter(r=>r.origin!=='crm').length;$('#stat-confirmed').textContent=records.filter(r=>r.crm_status==='confirmed').length;
 $('#stat-review').textContent=records.filter(r=>r.origin!=='crm'&&r.crm_status!=='confirmed').length;$('#stat-crm').textContent=records.filter(r=>r.origin==='crm').length;
 $('#source-note').textContent=result.crm_import.at?`Última consulta importada do CRM: ${formatDate(result.crm_import.at)}. Dados do CRM são uma fotografia dessa consulta; use Atualizar para reler os registros do site.`:'Histórico do CRM ainda não importado. Os registros do site são consultados diretamente no servidor.';
 currentPage=0;filter();notice();}catch(error){notice(error.message,true);}finally{button.disabled=false;}
}
function filter(){
 const query=$('#search').value.trim().toLocaleLowerCase('pt-BR'),status=$('#status').value;
 filtered=records.filter(r=>(!query||JSON.stringify(r).toLocaleLowerCase('pt-BR').includes(query))&&(!status||(status==='site'?r.origin!=='crm':status==='failed'?r.delivery==='failed':r.crm_status===status)));
 currentPage=Math.min(currentPage,Math.max(0,Math.ceil(filtered.length/pageSize)-1));renderRows();
}
function renderRows(){
 const body=$('#rows');body.replaceChildren();$('#visible-count').textContent=filtered.length;$('#empty').hidden=filtered.length>0;
 for(const row of filtered.slice(currentPage*pageSize,(currentPage+1)*pageSize)){
  const tr=document.createElement('tr'),person=document.createElement('td');person.append(element('strong',row.name||'Nome não disponível'),element('small',row.phone||row.email||'Contato não disponível'));tr.append(person,element('td',formatDate(row.received_at)));
  const source=document.createElement('td');let page=row.page||'';try{if(page)page=new URL(page,'https://raevo.io').pathname;}catch{}source.append(element('span',page||'Página não registrada'),element('small',row.origin==='crm'?'Histórico do Kommo':row.source||'Site Raevo'));tr.append(source);
  const status=document.createElement('td');status.append(element('span',labels[row.crm_status]||labels.unverified,`badge ${row.crm_status}`));if(row.delivery==='failed')status.append(element('small','Falha no envio à integração','failed'));tr.append(status);
  const action=document.createElement('td'),button=element('button','Ver detalhes →','text-button');button.addEventListener('click',()=>detail(row));action.append(button);tr.append(action);body.append(tr);
 }
 $('#page-info').textContent=filtered.length?`${currentPage*pageSize+1}–${Math.min((currentPage+1)*pageSize,filtered.length)} de ${filtered.length}`:'0 registros';$('#previous').disabled=currentPage===0;$('#next').disabled=(currentPage+1)*pageSize>=filtered.length;
}
function fields(container,data,prefix=''){
 for(const [key,value] of Object.entries(data||{})){
  const name=prefix?`${prefix} / ${key}`:key;
  if(value&&typeof value==='object'){fields(container,value,name);continue;}
  const item=element('div','','field');item.append(element('dt',name),element('dd',value===null?'—':String(value)));container.append(item);
 }
}
function crmLink(container,url,text){try{const parsed=new URL(url);if(parsed.protocol!=='https:'||parsed.hostname!=='raevo.kommo.com')return;const a=element('a',text,'crm-link');a.href=parsed.href;a.target='_blank';a.rel='noopener noreferrer';container.append(a);}catch{}}
function detail(row){
 $('#detail-name').textContent=row.name||'Registro';const content=$('#detail-content');content.replaceChildren();
 content.append(element('span',labels[row.crm_status]||labels.unverified,`badge ${row.crm_status}`));
 const meta=document.createElement('dl');fields(meta,{'Identificador':row.id,'Recebido no servidor':formatDate(row.received_at),'Informado no formulário':formatDate(row.submitted_at),'Página':row.page||'Não registrada','Origem':row.origin==='crm'?'Importado do CRM; envio pelo site não comprovado':row.source,'Entrega à integração':row.delivery||'Não disponível','Concluiu o teste':row.completed_at?formatDate(row.completed_at):'Não registrado'});content.append(meta);
 if(row.crm_matches?.length){content.append(element('h3','Correspondências no CRM'));for(const match of row.crm_matches)crmLink(content,match.url,`${match.name} · #${match.id} ↗`);}
 if(row.crm_url)crmLink(content,row.crm_url,`Abrir no Kommo #${row.crm_id} ↗`);
 content.append(element('h3',row.origin==='crm'?'Dados disponíveis no CRM':'Respostas e contexto do envio'));const answers=document.createElement('dl');fields(answers,row.payload);content.append(answers);
 if(row.assessment_result){content.append(element('h3','Resultado do diagnóstico'));const result=document.createElement('dl');fields(result,row.assessment_result);content.append(result);}
 $('#detail').showModal();
}
$('#login-form').addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget;const button=form.querySelector('button');button.disabled=true;try{const data=Object.fromEntries(new FormData(form));await api('login',{method:'POST',data});authenticated=true;form.elements.password.value='';renderRoute();await load();}catch(error){notice(error.message,true);}finally{button.disabled=false;}});
$('#logout').addEventListener('click',async()=>{try{await api('logout',{method:'POST'});records=[];filtered=[];authenticated=false;$('#rows').replaceChildren();$('#detail-content').replaceChildren();$('#detail').close();renderRoute();notice();const session=await api('session');csrf=session.csrf;}catch(error){notice(error.message,true);}});
$('#filter-form').addEventListener('submit',event=>{event.preventDefault();load();});$('#refresh').addEventListener('click',load);
$('#search').addEventListener('input',()=>{currentPage=0;filter();});$('#status').addEventListener('change',()=>{currentPage=0;filter();});
$('#previous').addEventListener('click',()=>{currentPage--;renderRows();});$('#next').addEventListener('click',()=>{currentPage++;renderRows();});
$('#close-detail').addEventListener('click',()=>$('#detail').close());
$('#export').addEventListener('click',()=>{
 const cell=value=>'"'+String(value??'').replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';
 const rows=[['ID','Nome','Telefone','Email','Recebido em','Página','Origem','Situação CRM','Entrega','Respostas'],...filtered.map(r=>[r.id,r.name,r.phone,r.email,r.received_at,r.page,r.origin,labels[r.crm_status],r.delivery,JSON.stringify(r.payload)])];
 const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(row=>row.map(cell).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`raevo-leads-${$('#from').value}-${$('#to').value}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
$('#import').addEventListener('click',async()=>{const file=$('#import-file').files[0];if(!file){notice('Selecione o arquivo de histórico.',true);return;}$('#import').disabled=true;try{if(file.size>8000000)throw new Error('Arquivo muito grande.');const data=JSON.parse(await file.text());const result=await api('import',{method:'POST',data});await load();notice(`${result.imported} registros importados.`);}catch(error){notice(error.message,true);}finally{$('#import').disabled=false;}});
window.addEventListener('hashchange',renderRoute);
const today=new Date(),start=new Date();start.setDate(start.getDate()-29);const localDate=date=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Bahia',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
$('#from').value=localDate(start);$('#to').value=localDate(today);
try{const session=await api('session');authenticated=session.authenticated;renderRoute();if(authenticated)await load();}catch(error){renderRoute();notice(error.message,true);}
