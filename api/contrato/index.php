<?php
declare(strict_types=1);
function reply(int $status,array $data):never {http_response_code($status);header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store, private');header('X-Content-Type-Options: nosniff');header('X-Robots-Tag: noindex,nofollow');echo json_encode($data,JSON_UNESCAPED_UNICODE);exit;}
$origin=$_SERVER['HTTP_ORIGIN']??'';
$allowed=['https://raevo.io','https://www.raevo.io'];
if(getenv('CONTRACT_TEST_ORIGIN'))$allowed[]=(string)getenv('CONTRACT_TEST_ORIGIN');
if($origin!==''&&!in_array($origin,$allowed,true))reply(403,['message'=>'Origem não permitida.']);
session_name('raevo_contract');session_set_cookie_params(['lifetime'=>0,'path'=>'/api/contrato/','secure'=>($_SERVER['HTTPS']??'')==='on','httponly'=>true,'samesite'=>'Strict']);session_start();
$_SESSION['csrf']??=bin2hex(random_bytes(24));
$method=$_SERVER['REQUEST_METHOD']??'GET';
if($method==='GET')reply(200,['csrf'=>$_SESSION['csrf']]);
if($method!=='POST'){header('Allow: GET, POST');reply(405,['message'=>'Método não permitido.']);}
if(!in_array($origin,$allowed,true))reply(403,['message'=>'Abra o formulário no site da Raevo.']);
if((int)($_SERVER['CONTENT_LENGTH']??0)>12000)reply(413,['message'=>'Os dados excedem o tamanho permitido.']);
try{$data=json_decode((string)file_get_contents('php://input'),true,32,JSON_THROW_ON_ERROR);}catch(Throwable){reply(400,['message'=>'Dados inválidos.']);}
if(!is_array($data)||!hash_equals($_SESSION['csrf'],(string)($data['csrf']??'')))reply(403,['message'=>'Recarregue a página antes de enviar.']);
if(!empty($data['website']))reply(422,['message'=>'Revise os dados.']);
$id=(string)($data['submission_id']??'');if(!preg_match('/^[a-f0-9-]{36}$/i',$id))reply(422,['message'=>'Recarregue a página antes de enviar.']);
$fields=['country','entity_type','legal_name','tax_id','trade_name','address','city','region','postal_code','representative','role','authority','email','phone','service','billing_email','notes','submission_id'];$payload=[];foreach($fields as $key){if(isset($data[$key])&&!is_string($data[$key]))reply(422,['message'=>'Revise os dados.']);$payload[$key]=trim((string)($data[$key]??''));}
$payload['acknowledged']=($data['acknowledged']??false)===true;
if(!$payload['acknowledged']||!in_array($payload['country'],['BR','PT'],true)||!in_array($payload['entity_type'],['person','company'],true))reply(422,['message'=>'Revise os dados e a confirmação.']);
foreach(['legal_name','tax_id','address','city','postal_code','email','phone','service'] as $key)if($payload[$key]===''||strlen($payload[$key])>500)reply(422,['message'=>'Preencha os dados obrigatórios.']);
if(!filter_var($payload['email'],FILTER_VALIDATE_EMAIL))reply(422,['message'=>'Confira o e-mail.']);
$storage=(getenv('CONTRACT_PRIVATE_STORAGE_PATH')?:dirname(rtrim((string)($_SERVER['DOCUMENT_ROOT']??dirname(__DIR__,3)),'/')).'/raevo-private/contracts');
if(!is_dir($storage)&&!mkdir($storage,0700,true)&&!is_dir($storage))reply(503,['message'=>'O envio está temporariamente indisponível. Tente mais tarde.']);
@chmod($storage,0700);
$lock=fopen($storage.'/gateway.lock','c+');if(!$lock||!flock($lock,LOCK_EX))reply(503,['message'=>'Tente novamente dentro de instantes.']);
$map=$storage.'/submission-'.hash('sha256',$id).'.json';
$hash=hash('sha256',json_encode($payload));
if(is_file($map)){$saved=json_decode((string)file_get_contents($map),true);if(($saved['hash']??'')!==$hash)reply(409,['message'=>'Já houve um envio nesta página. Recarregue para enviar dados diferentes.']);if(($saved['state']??'')==='accepted')reply(200,['accepted'=>true]);if(($saved['state']??'')==='pending')reply(503,['message'=>'O envio está a ser conferido. Contacte a Raevo se não receber retorno; não é necessário reenviar.']);}
$ratePath=$storage.'/rate-'.hash('sha256',(string)($_SERVER['REMOTE_ADDR']??'')).'.json';$rate=is_file($ratePath)?json_decode((string)file_get_contents($ratePath),true):null;
if(!is_array($rate)||($rate['at']??0)<time()-3600)$rate=['at'=>time(),'count'=>0];
if($rate['count']>=12){header('Retry-After: 3600');reply(429,['message'=>'Foram feitos vários envios. Tente mais tarde.']);}$rate['count']++;file_put_contents($ratePath,json_encode($rate),LOCK_EX);@chmod($ratePath,0600);
$url=getenv('CONTRACT_WEBHOOK_URL')?:'https://automacao.growautomacao.com.br/webhook/raevo-contract-24f0fe182188ee6fc1ef9db09915b7ca7f4b';
if(str_contains($url,'REPLACE'))reply(503,['message'=>'O envio está temporariamente indisponível. Tente mais tarde.']);
$record=['hash'=>$hash,'state'=>'pending','at'=>gmdate(DATE_ATOM)];file_put_contents($map,json_encode($record),LOCK_EX);@chmod($map,0600);
$handle=curl_init($url);curl_setopt_array($handle,[CURLOPT_POST=>true,CURLOPT_RETURNTRANSFER=>true,CURLOPT_HTTPHEADER=>['Content-Type: application/json'],CURLOPT_POSTFIELDS=>json_encode($payload,JSON_UNESCAPED_UNICODE),CURLOPT_CONNECTTIMEOUT=>5,CURLOPT_TIMEOUT=>50,CURLOPT_FOLLOWLOCATION=>false]);$raw=curl_exec($handle);$code=(int)curl_getinfo($handle,CURLINFO_HTTP_CODE);curl_close($handle);$result=is_string($raw)?json_decode($raw,true):null;
if($code>=200&&$code<300&&($result['accepted']??false)===true){$record['state']='accepted';file_put_contents($map,json_encode($record),LOCK_EX);reply(201,['accepted'=>true]);}
if(in_array($code,[400,403,413,422,429],true)){$record['state']='rejected';file_put_contents($map,json_encode($record),LOCK_EX);reply($code,['message'=>'Não foi possível validar o envio. Confira os dados e tente novamente.']);}
reply(503,['message'=>'Ainda não foi possível confirmar o envio. A Raevo vai conferir o registo; contacte a equipa se precisar de ajuda.']);
