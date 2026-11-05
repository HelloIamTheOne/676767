const _0xc299a=_0x36b5;function _0x36b5(_0xa19af5,_0x15ab8f){_0xa19af5=_0xa19af5-0x1f0;const _0x2810a8=_0x2810();let _0x36b514=_0x2810a8[_0xa19af5];return _0x36b514;}(function(_0x161188,_0x301ef0){const _0x2a96e0=_0x36b5,_0x54b0be=_0x161188();while(!![]){try{const _0x13bffb=parseInt(_0x2a96e0(0x22a))/0x1+parseInt(_0x2a96e0(0x225))/0x2*(parseInt(_0x2a96e0(0x244))/0x3)+-parseInt(_0x2a96e0(0x295))/0x4+parseInt(_0x2a96e0(0x272))/0x5+parseInt(_0x2a96e0(0x269))/0x6+parseInt(_0x2a96e0(0x28d))/0x7+-parseInt(_0x2a96e0(0x267))/0x8;if(_0x13bffb===_0x301ef0)break;else _0x54b0be['push'](_0x54b0be['shift']());}catch(_0x4be892){_0x54b0be['push'](_0x54b0be['shift']());}}}(_0x2810,0x962eb));const SUPABASE_URL='https://wiwqnlhavvmhnwmoyjtw.supabase.co',SUPABASE_KEY=_0xc299a(0x27c),ADMIN_UID=_0xc299a(0x250);let db=null;try{window['supabase']&&typeof window[_0xc299a(0x1f3)][_0xc299a(0x21b)]===_0xc299a(0x1fe)&&(db=window[_0xc299a(0x1f3)][_0xc299a(0x21b)](SUPABASE_URL,SUPABASE_KEY));}catch(_0x2b0b3e){console['error']('Error\x20de\x20Supabase:',_0x2b0b3e);}let isAdmin=![],secret2Interval=null,secret2Seconds=0x1e,secret2Finished=![];function show(_0x522cb7){const _0x367e5f=_0xc299a,_0x1e7588=['home','docs',_0x367e5f(0x263),'secret',_0x367e5f(0x227)];if(!_0x1e7588[_0x367e5f(0x247)](_0x522cb7))return;document[_0x367e5f(0x284)](_0x367e5f(0x22b))['forEach'](_0x5763f0=>{const _0x18002e=_0x367e5f;_0x5763f0['classList'][_0x18002e(0x279)](_0x18002e(0x1fd));}),document['getElementById'](_0x522cb7)[_0x367e5f(0x281)]['add']('active'),document[_0x367e5f(0x20a)][_0x367e5f(0x281)][_0x367e5f(0x23f)]('secret-mode',_0x522cb7===_0x367e5f(0x21e)),document[_0x367e5f(0x20a)][_0x367e5f(0x281)][_0x367e5f(0x23f)]('secret2-mode',_0x522cb7===_0x367e5f(0x227));if(_0x522cb7==='secret'){const _0x349c6b=document['getElementById']('secretMessage');_0x349c6b[_0x367e5f(0x226)]='',_0x349c6b[_0x367e5f(0x24c)][_0x367e5f(0x21d)]=_0x367e5f(0x1f9),_0x349c6b['textContent']='';}_0x522cb7===_0x367e5f(0x227)&&resetSecret2Challenge(),updateDetector();} async function secretCheck() {
  const message = document.getElementById('secretMessage');

  message.className = '';
  message.style.display = 'block';
  message.textContent = 'PASO 1: Iniciando verificación...';

  try {
    if (!db) {
      message.className = 'secret-denied';
      message.textContent = 'ERROR: Supabase no está inicializado.';
      return;
    }

    message.textContent = 'PASO 2: Comprobando sesión...';

    const { data, error } = await db.auth.getSession();

    if (error) throw error;

    const session = data.session;

    if (!session) {
      message.className = 'secret-denied';
      message.textContent = 'ERROR: No se encontró una sesión activa.';
      return;
    }

    message.textContent = 'PASO 3: Enviando solicitud a Supabase...';

    const response = await fetch(
      SUPABASE_URL + '/functions/v1/verify-secret',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + session.access_token
        },
        body: JSON.stringify({
          challenge: 'secret1_admin'
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        'Respuesta HTTP ' + response.status + ': ' + errorText
      );
    }

    message.textContent = 'PASO 4: Procesando respuesta...';

    const result = await response.json();

    if (result.correct === true) {
      message.className = 'secret-allowed';
      message.textContent =
        '(1 + 1 - 3 + 9 + 10 - 6 - 4)';
    } else {
      message.className = 'secret-denied';
      message.textContent =
        'VERIFICACIÓN RECHAZADA: Supabase no reconoció al administrador.';
    }

  } catch (error) {
    console.error('Error en Secreto 1:', error);
    message.className = 'secret-denied';
    message.textContent = 'ERROR: ' + error.message;
  }
}
 function startSecret2Challenge(){const _0x49b6c3=_0xc299a;if(secret2Finished)return;const _0x1fc4df=document['getElementById'](_0x49b6c3(0x201)),_0x2a3eaf=document[_0x49b6c3(0x27d)](_0x49b6c3(0x251));_0x2a3eaf['style']['display']='none',_0x2a3eaf[_0x49b6c3(0x226)]=_0x49b6c3(0x21f),_0x1fc4df[_0x49b6c3(0x24c)]['display']=_0x49b6c3(0x241),secret2Seconds=0x1e,document['getElementById'](_0x49b6c3(0x229))['textContent']=0x1e,document[_0x49b6c3(0x27d)](_0x49b6c3(0x203))['value']='',clearInterval(secret2Interval),secret2Interval=setInterval(()=>{const _0xc3047e=_0x49b6c3;secret2Seconds--,document[_0xc3047e(0x27d)](_0xc3047e(0x229))[_0xc3047e(0x260)]=secret2Seconds,secret2Seconds<=0x0&&(clearInterval(secret2Interval),finishSecret2(![]));},0x3e8);}function submitSecret2Answer(){const _0x4f9fd2=_0xc299a;if(secret2Finished)return;const _0x2de2cc=document['getElementById'](_0x4f9fd2(0x203))[_0x4f9fd2(0x234)];if(!_0x2de2cc)return;finishSecret2(_0x2de2cc==='8');}function finishSecret2(_0x3bef85){const _0x46ad0a=_0xc299a;clearInterval(secret2Interval),secret2Finished=!![],document[_0x46ad0a(0x27d)]('secret2Challenge')[_0x46ad0a(0x24c)]['display']='none';const _0x1e8352=document[_0x46ad0a(0x27d)]('secret2Result');_0x1e8352[_0x46ad0a(0x24c)][_0x46ad0a(0x21d)]=_0x46ad0a(0x241),_0x3bef85?(_0x1e8352['className']=_0x46ad0a(0x266),_0x1e8352['innerHTML']='01000001\x2001100010\x2001100001\x2001101010\x2001101111'+'<button\x20class=\x22secret2-close\x22\x20onclick=\x22closeSecret2Result()\x22>X</button>'):(_0x1e8352[_0x46ad0a(0x226)]=_0x46ad0a(0x1ff),_0x1e8352[_0x46ad0a(0x27b)]='ACCESO\x20DENEGADO'+'<button\x20class=\x22secret2-close\x22\x20onclick=\x22closeSecret2Result()\x22>X</button>');}function closeSecret2Result(){const _0x5b7c47=_0xc299a;document['getElementById'](_0x5b7c47(0x251))['style'][_0x5b7c47(0x21d)]=_0x5b7c47(0x1f9);}function resetSecret2Challenge(){const _0x577ded=_0xc299a;clearInterval(secret2Interval),secret2Finished=![],secret2Seconds=0x1e,document['getElementById'](_0x577ded(0x201))[_0x577ded(0x24c)]['display']=_0x577ded(0x1f9),document[_0x577ded(0x27d)](_0x577ded(0x251))['style'][_0x577ded(0x21d)]='none',document['getElementById']('secret2Timer')['textContent']='30',document['getElementById']('secret2Answer')['value']='';}function revealSecret2Bottom(){const _0x33f5c5=_0xc299a;document[_0x33f5c5(0x27d)](_0x33f5c5(0x22f))['style'][_0x33f5c5(0x21d)]=_0x33f5c5(0x241);}function checkSecret2Bottom(){const _0x65bdd2=_0xc299a,_0x3ebd34=document['getElementById']('secret2BottomInput')['value'];document['getElementById'](_0x65bdd2(0x26a))['style']['display']=_0x3ebd34===_0x65bdd2(0x233)?_0x65bdd2(0x241):_0x65bdd2(0x1f9);}function closeSecret2Abajo(){const _0x40c82a=_0xc299a;document[_0x40c82a(0x27d)](_0x40c82a(0x26a))['style']['display']='none';} function updateAdmin() {
  document.body.classList.toggle('admin-mode', isAdmin);

  document.querySelectorAll('.adminOnly').forEach(element => {
    if (!isAdmin) {
      element.style.display = 'none';
    } else {
      element.style.display =
        element.tagName === 'DIV' ? 'block' : 'inline-block';
    }
  });

  const restorePanel = document.getElementById('restorePanel');

  if (restorePanel) {
    restorePanel.style.display = isAdmin ? 'block' : 'none';
  }

  updateDetector();
}function toggleLogin(){const _0x3d677c=_0xc299a,_0xcb7955=document[_0x3d677c(0x27d)]('loginPanel');_0xcb7955[_0x3d677c(0x24c)][_0x3d677c(0x21d)]=_0xcb7955['style'][_0x3d677c(0x21d)]==='block'?'none':_0x3d677c(0x241);}function loginMessage(_0x2a1397,_0x140c54=_0xc299a(0x25a)){const _0x1e3145=_0xc299a,_0x152420=document[_0x1e3145(0x27d)]('loginMessage');_0x152420[_0x1e3145(0x260)]=_0x2a1397,_0x152420['style'][_0x1e3145(0x22c)]=_0x140c54;}async function adminLogin(){const _0x31e6b9=_0xc299a,_0xc819e1=document[_0x31e6b9(0x27d)]('adminEmail')['value'],_0xf252ca=document[_0x31e6b9(0x27d)](_0x31e6b9(0x27e))['value'];if(_0xc819e1['trim']()[_0x31e6b9(0x28a)]()==='celeste'&&_0xf252ca[_0x31e6b9(0x1f1)]()['toLowerCase']()===_0x31e6b9(0x24b)){document[_0x31e6b9(0x27d)](_0x31e6b9(0x26e))[_0x31e6b9(0x234)]='',document['getElementById']('adminPassword')['value']='',document[_0x31e6b9(0x27d)](_0x31e6b9(0x261))['style'][_0x31e6b9(0x21d)]=_0x31e6b9(0x1f9),show(_0x31e6b9(0x227));return;}const _0x312a74=_0xc819e1['trim']();if(!_0x312a74||!_0xf252ca){loginMessage(_0x31e6b9(0x23e),_0x31e6b9(0x23c));return;}if(!db){loginMessage(_0x31e6b9(0x236),'#ff2020');return;}const _0x87d21d=document['getElementById']('loginButton');_0x87d21d['disabled']=!![],_0x87d21d[_0x31e6b9(0x260)]=_0x31e6b9(0x275),loginMessage('Conectando\x20con\x20Supabase...');try{const {data:_0xbbf9c2,error:_0x464536}=await db['auth'][_0x31e6b9(0x280)]({'email':_0x312a74,'password':_0xf252ca});if(_0x464536)throw _0x464536;if(!_0xbbf9c2[_0x31e6b9(0x232)]||_0xbbf9c2['user']['id']!==ADMIN_UID){const _0xb48302=_0xbbf9c2[_0x31e6b9(0x232)]?.['id']||_0x31e6b9(0x1fb);await db['auth'][_0x31e6b9(0x253)](),isAdmin=![],updateAdmin(),loginMessage('UID\x20INCORRECTO.\x20Cuenta:\x20'+_0xb48302+'\x20|\x20Administrador:\x20'+ADMIN_UID,_0x31e6b9(0x23c));return;}const {data:_0x51d526,error:_0x157717}=await db[_0x31e6b9(0x28b)][_0x31e6b9(0x274)]();if(_0x157717||_0x51d526[_0x31e6b9(0x232)]?.['id']!==ADMIN_UID){await db[_0x31e6b9(0x28b)][_0x31e6b9(0x253)](),isAdmin=![],updateAdmin(),loginMessage(_0x31e6b9(0x200),_0x31e6b9(0x23c));return;}isAdmin=!![],updateAdmin(),document[_0x31e6b9(0x27d)](_0x31e6b9(0x261))[_0x31e6b9(0x24c)][_0x31e6b9(0x21d)]=_0x31e6b9(0x1f9),document[_0x31e6b9(0x27d)](_0x31e6b9(0x27e))['value']='',await loadDocs(),alert('¡Administrador\x20activado!');}catch(_0x304e6f){loginMessage('Error:\x20'+_0x304e6f[_0x31e6b9(0x246)],'#ff2020');}finally{_0x87d21d['disabled']=![],_0x87d21d['textContent']=_0x31e6b9(0x257);}}async function logout(){const _0x31d590=_0xc299a;if(!db){alert('No\x20hay\x20conexión\x20con\x20Supabase.');return;}try{const {error:_0x18e573}=await db[_0x31d590(0x28b)]['signOut']();if(_0x18e573)throw _0x18e573;isAdmin=![],updateAdmin(),await loadDocs(),show(_0x31d590(0x27f)),alert(_0x31d590(0x25d));}catch(_0x52b535){alert('Error:\x20'+_0x52b535['message']);}}async function checkSession(){const _0x28ad03=_0xc299a;if(!db){isAdmin=![],updateAdmin(),document['getElementById'](_0x28ad03(0x25b))[_0x28ad03(0x260)]='No\x20se\x20pudo\x20conectar\x20con\x20Supabase.';return;}try{const {data:_0x46b6b8,error:_0x4d15ec}=await db[_0x28ad03(0x28b)]['getUser']();if(_0x4d15ec)throw _0x4d15ec;isAdmin=_0x46b6b8[_0x28ad03(0x232)]?.['id']===ADMIN_UID;}catch(_0x196ae1){console['error']('Error\x20verificando\x20sesión:',_0x196ae1),isAdmin=![];}updateAdmin(),await loadDocs();}db&&db['auth'][_0xc299a(0x215)]((_0xe76c13,_0x57d10a)=>{const _0x301349=_0xc299a,_0x362180=isAdmin;isAdmin=_0x57d10a?.[_0x301349(0x232)]?.['id']===ADMIN_UID,updateAdmin(),_0x362180!==isAdmin&&setTimeout(()=>{loadDocs();},0x0);});function editSection(_0x17fc91){const _0x1462e9=_0xc299a;if(!isAdmin)return;const _0x5a8d5e=document['getElementById'](_0x17fc91+_0x1462e9(0x291)),_0x268e2e=document[_0x1462e9(0x27d)](_0x17fc91+_0x1462e9(0x245));if(!_0x5a8d5e||!_0x268e2e)return;const _0xa44280=prompt(_0x1462e9(0x1f7),_0x5a8d5e[_0x1462e9(0x260)]);_0xa44280!==null&&_0xa44280[_0x1462e9(0x1f1)]()&&(_0x5a8d5e['textContent']=_0xa44280[_0x1462e9(0x1f1)]());const _0xd0ed99=prompt(_0x1462e9(0x237),_0x268e2e['textContent']);_0xd0ed99!==null&&_0xd0ed99[_0x1462e9(0x1f1)]()&&(_0x268e2e['textContent']=_0xd0ed99[_0x1462e9(0x1f1)]());}function _0x2810(){const _0x465b38=['11416xokDIi','className','secret2','alt','secret2Timer','347732GnBPNc','.page','color','from','.page.active','secret2HiddenArea','Descargar','Señal\x20detectada','user','Abajo','value','\x20copia(s)\x20de\x20seguridad.\x0a\x0a','No\x20se\x20pudo\x20conectar\x20con\x20Supabase.','Nueva\x20descripción:','getSession','Error\x20al\x20eliminar:\x20','length','Documento\x20eliminado\x20correctamente','#ff2020','getClientRects','Escribe\x20tu\x20correo\x20y\x20contraseña','toggle','card','block','.secret-trigger','Sesión\x20administrativa\x20no\x20válida.','66OYgVPM','Description','message','includes','Error\x20creando\x20la\x20copia.','CREAR\x20COPIA\x20DE\x20SEGURIDAD','detectorText','celeste','style','Error\x20al\x20eliminar\x20documento:','button','secret-denied','a899ab31-456a-40dc-b03d-af59182afd41','secret2Result','getBoundingClientRect','signOut','Acceso\x20administrativo\x20requerido.','publicUrl','top','INICIAR\x20SESIÓN','detectorPercentage','insert','#87CEFA','documents','img','Sesión\x20cerrada','POST','No\x20se\x20confirmó\x20la\x20creación\x20de\x20la\x20copia.','textContent','loginPanel','testJS','class','Bearer\x20','¡Copia\x20de\x20seguridad\x20creada\x20correctamente!\x0a\x0a','secret2-result\x20secret2-success','11263920VmlsGm','No\x20hay\x20botones\x20activos','3704796RwWuEO','secret2AbajoResult','round','clientX','push','adminEmail','.adminOnly','getPublicUrl','clientY','4794680aZSgfR','Eliminar','getUser','CONECTANDO...','cover_path','jsStatus','Acceso\x20Restringido.\x20Nivel\x20insuficiente.','remove','click','innerHTML','sb_publishable_vQHchnFMXr4K5NuWYZD3HA_bXXpyHxZ','getElementById','adminPassword','home','signInWithPassword','classList','blue','filter','querySelectorAll','error','div','confirmationRequired','createElement','docName','toLowerCase','auth','file','8255688KTGkmK','href','documentos','image/gif','Title','created_at','cover_url','upload','4823828ODUYxW','json','cover','trim','Error:\x20','supabase','/functions/v1/dynamic-handler','No\x20se\x20pudo\x20conectar\x20con\x20el\x20servicio.','randomUUID','Nuevo\x20título:','-cover','none','?download','No\x20disponible','show','active','function','secret2-result\x20secret2-failure','No\x20se\x20pudo\x20verificar\x20la\x20cuenta.','secret2Challenge','onclick','secret2Answer','height','No\x20hay\x20documentos\x20disponibles.','type','max','append','name','body','width','admin-mode','Buscando\x20proximidad...','DIV','forEach','Total\x20de\x20copias:\x20','querySelector','addEventListener','files','Error\x20al\x20agregar\x20el\x20documento:\x20','onAuthStateChange','secretMessage','Completa\x20el\x20nombre\x20y\x20selecciona\x20un\x20PDF','.pdf','Señal\x20débil','download','createClient','Cargando\x20documentos...','display','secret','secret2-result','delete','detectorBar','storage','¿Eliminar\x20este\x20documento?','select'];_0x2810=function(){return _0x465b38;};return _0x2810();}async function loadDocs() {
  const container = document.getElementById('documents');

  if (!container) return;

  if (!db) {
    container.textContent = 'Servicio de documentos no disponible.';
    return;
  }

  container.textContent = 'Cargando documentos...';

  try {
    const { data: documents, error } = await db
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    container.replaceChildren();

    if (!documents || documents.length === 0) {
      container.textContent = 'No hay documentos disponibles.';
      return;
    }

    // Los conteos se solicitan únicamente durante una sesión administrativa.
    let backupCounts = null;

    if (isAdmin) {
      try {
        const { data: sessionData, error: sessionError } =
          await db.auth.getSession();

        if (sessionError) throw sessionError;

        const session = sessionData?.session;

        if (!session || session.user.id !== ADMIN_UID) {
          throw new Error('Sesión administrativa no válida.');
        }

        const response = await fetch(
          SUPABASE_URL + '/functions/v1/dynamic-handler',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_KEY,
              'Authorization': 'Bearer ' + session.access_token
            },
            body: JSON.stringify({ action: 'getBackupCounts' })
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || result.message ||
            'No se pudieron consultar los conteos de copias.'
          );
        }

        backupCounts = result.counts || {};
      } catch (countError) {
        console.error('Error consultando conteos de copias:', countError);
      }
    }

    documents.forEach(doc => {
      const card = document.createElement('div');
      card.className = 'card';

      const image = document.createElement('img');
      image.src = doc.cover_url ||
        'https://placehold.co/400x200/101010/39FF14?text=DOCUMENTO';
      image.alt = 'Portada del documento';

      const title = document.createElement('h3');
      title.textContent = doc.name;

      const downloadButton = document.createElement('button');
      downloadButton.className = 'green';
      downloadButton.textContent = 'Descargar';
      downloadButton.onclick = () => {
        if (!doc.file_url) return;

        const link = document.createElement('a');
        link.href = doc.file_url + '?download';
        link.download = '';
        document.body.appendChild(link);
        link.click();
        link.remove();
      };

      card.append(image, title, downloadButton);

      if (isAdmin) {
        const backupCount = document.createElement('p');
        backupCount.className = 'backup-count';
        backupCount.style.margin = '10px 0';
        backupCount.style.fontSize = '0.9em';
        backupCount.style.color = '#87CEFA';
        backupCount.textContent = backupCounts
          ? 'Copias de seguridad: ' + (backupCounts[doc.id] ?? 0)
          : 'Copias de seguridad: No disponible';
        card.appendChild(backupCount);

        const backupButton = document.createElement('button');
        backupButton.className = 'blue';
        backupButton.textContent = 'CREAR COPIA DE SEGURIDAD';
        backupButton.onclick = () => crearCopiaSeguridad(doc);
        card.appendChild(backupButton);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'red';
        deleteButton.textContent = 'Eliminar';
        deleteButton.onclick = () => deleteDoc(doc);
        card.appendChild(deleteButton);
      }

      container.appendChild(card);
    });
  } catch (error) {
    console.error(error);
    container.textContent = 'Error cargando documentos: ' + error.message;
  }
}async function addDoc(){const _0x7cbb6=_0xc299a;if(!isAdmin||!db)return;const _0x487c1b=document['getElementById'](_0x7cbb6(0x289))['value']['trim'](),_0x1947ed=document['getElementById'](_0x7cbb6(0x28c))[_0x7cbb6(0x213)][0x0],_0x311249=document[_0x7cbb6(0x27d)]('cover')[_0x7cbb6(0x213)][0x0];if(!_0x487c1b||!_0x1947ed){alert(_0x7cbb6(0x217));return;}if(_0x1947ed[_0x7cbb6(0x206)]!=='application/pdf'){alert('Selecciona\x20un\x20PDF\x20válido');return;}if(_0x1947ed['size']===0x0){alert('El\x20PDF\x20está\x20vacío');return;}if(_0x1947ed['size']>0x14*0x400*0x400){alert('El\x20PDF\x20no\x20puede\x20superar\x20los\x2020\x20MB');return;}const _0x553324=['image/jpeg','image/png','image/webp',_0x7cbb6(0x290)];if(_0x311249&&!_0x553324['includes'](_0x311249['type'])){alert('Formato\x20de\x20imagen\x20no\x20permitido');return;}if(_0x311249&&_0x311249['size']>0x32*0x400*0x400){alert('La\x20imagen\x20no\x20puede\x20superar\x20los\x2050\x20MB');return;}const _0x4a3f49=crypto[_0x7cbb6(0x1f6)](),_0x5c8874=_0x4a3f49+_0x7cbb6(0x218);let _0x4b64b9=null,_0x5856c5=[];try{let _0xf9cdd3=await db[_0x7cbb6(0x222)]['from']('documentos')[_0x7cbb6(0x294)](_0x5c8874,_0x1947ed,{'contentType':'application/pdf'});if(_0xf9cdd3['error'])throw _0xf9cdd3[_0x7cbb6(0x285)];_0x5856c5[_0x7cbb6(0x26d)](_0x5c8874);const _0x4c9832=db[_0x7cbb6(0x222)][_0x7cbb6(0x22d)]('documentos')[_0x7cbb6(0x270)](_0x5c8874)['data']['publicUrl'];let _0x495d0b=null;if(_0x311249){_0x4b64b9=_0x4a3f49+_0x7cbb6(0x1f8),_0xf9cdd3=await db[_0x7cbb6(0x222)][_0x7cbb6(0x22d)](_0x7cbb6(0x28f))['upload'](_0x4b64b9,_0x311249,{'contentType':_0x311249[_0x7cbb6(0x206)]});if(_0xf9cdd3[_0x7cbb6(0x285)])throw _0xf9cdd3[_0x7cbb6(0x285)];_0x5856c5[_0x7cbb6(0x26d)](_0x4b64b9),_0x495d0b=db['storage']['from'](_0x7cbb6(0x28f))['getPublicUrl'](_0x4b64b9)['data'][_0x7cbb6(0x255)];}const {error:_0x3fe52e}=await db['from']('documents')[_0x7cbb6(0x259)]([{'name':_0x487c1b,'file_url':_0x4c9832,'file_path':_0x5c8874,'cover_url':_0x495d0b,'cover_path':_0x4b64b9}]);if(_0x3fe52e)throw _0x3fe52e;document['getElementById'](_0x7cbb6(0x289))[_0x7cbb6(0x234)]='',document[_0x7cbb6(0x27d)]('file')['value']='',document[_0x7cbb6(0x27d)](_0x7cbb6(0x1f0))[_0x7cbb6(0x234)]='',alert('Documento\x20agregado\x20correctamente'),await loadDocs();}catch(_0x487362){console[_0x7cbb6(0x285)](_0x487362);if(_0x5856c5['length'])try{const {error:_0x56baae}=await db[_0x7cbb6(0x222)][_0x7cbb6(0x22d)](_0x7cbb6(0x28f))[_0x7cbb6(0x279)](_0x5856c5);if(_0x56baae)console[_0x7cbb6(0x285)](_0x56baae);}catch(_0x5643ef){console['error'](_0x5643ef);}alert(_0x7cbb6(0x214)+_0x487362['message']);}}async function deleteDoc(_0x409903){const _0x22add1=_0xc299a;if(!isAdmin||!db||!_0x409903?.['id'])return;if(!confirm(_0x22add1(0x223)))return;const _0x3a606b=[_0x409903['file_path'],_0x409903[_0x22add1(0x276)]][_0x22add1(0x283)](_0x5a7d9d=>typeof _0x5a7d9d==='string'&&_0x5a7d9d[_0x22add1(0x1f1)]()!=='');try{if(_0x3a606b[_0x22add1(0x23a)]){const {error:_0x5fd01}=await db[_0x22add1(0x222)][_0x22add1(0x22d)]('documentos')['remove'](_0x3a606b);if(_0x5fd01)throw new Error('No\x20se\x20pudieron\x20eliminar\x20los\x20archivos.\x20'+'El\x20registro\x20se\x20conservará.\x20'+_0x5fd01[_0x22add1(0x246)]);}const {error:_0x417126}=await db[_0x22add1(0x22d)]('documents')[_0x22add1(0x220)]()['eq']('id',_0x409903['id']);if(_0x417126)throw new Error('Los\x20archivos\x20fueron\x20eliminados,\x20pero\x20no\x20se\x20pudo\x20'+'eliminar\x20el\x20registro.\x20'+_0x417126[_0x22add1(0x246)]);alert(_0x22add1(0x23b)),await loadDocs();}catch(_0x173d10){console[_0x22add1(0x285)](_0x22add1(0x24d),_0x173d10),alert(_0x22add1(0x239)+_0x173d10['message']),await loadDocs();}}async function crearCopiaSeguridad(doc, confirmDuplicate = false) {
  if (!isAdmin || !db || !doc || !doc.id) {
    alert('Acceso administrativo requerido.');
    return;
  }

  if (
    !confirmDuplicate &&
    !confirm('¿Crear una copia de seguridad de "' + doc.name + '"?')
  ) {
    return;
  }

  try {
    const { data: sessionData, error: sessionError } =
      await db.auth.getSession();

    if (sessionError) throw sessionError;

    const session = sessionData?.session;

    if (!session || session.user.id !== ADMIN_UID) {
      throw new Error('Sesión administrativa no válida.');
    }

    const response = await fetch(
      SUPABASE_URL + '/functions/v1/dynamic-handler',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + session.access_token
        },
        body: JSON.stringify({
          documentId: doc.id,
          confirmDuplicate: confirmDuplicate
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || result.message || 'Error creando la copia.'
      );
    }

    if (result.confirmationRequired) {
      const confirmed = confirm(
        'Este documento ya tiene ' + result.existingCount +
        ' copia(s) de seguridad.\n\n¿Deseas crear otra copia?'
      );

      if (confirmed) {
        await crearCopiaSeguridad(doc, true);
      }

      return;
    }

    if (!result.success) {
      throw new Error(
        result.error || 'No se confirmó la creación de la copia.'
      );
    }

    alert(
      '¡Copia de seguridad creada correctamente!\n\n' +
      'Documento: ' + doc.name +
      '\nTotal de copias: ' + result.totalBackups
    );

    console.log('Resultado de la copia:', result);

    // Actualiza el conteo visible en las tarjetas.
    await loadDocs();
  } catch (error) {
    console.error('Error de copia de seguridad:', error);
    alert('Error: ' + error.message);
  }
}function getSecretTargets(){const _0x1258d0=_0xc299a,_0x15d336=document[_0x1258d0(0x211)](_0x1258d0(0x22e));if(!_0x15d336)return[];const _0x260678={'home':[_0x1258d0(0x242)],'secret2':['.secret2-trigger','.secret2-bottom-hotspot']},_0x38af66=_0x260678[_0x15d336['id']]||[];return _0x38af66['map'](_0x6a63c9=>_0x15d336[_0x1258d0(0x211)](_0x6a63c9))['filter'](_0x2bcce1=>_0x2bcce1&&_0x2bcce1[_0x1258d0(0x23d)]()['length']>0x0);}function updateDetector(){const _0x1d955c=_0xc299a;if(!isAdmin)return;const _0x24aa7e=document[_0x1d955c(0x27d)]('detectorPercentage'),_0x3ed3af=document[_0x1d955c(0x27d)](_0x1d955c(0x221)),_0x10d5bf=document['getElementById']('detectorText');if(!_0x24aa7e||!_0x3ed3af||!_0x10d5bf)return;_0x24aa7e['textContent']='0%',_0x3ed3af[_0x1d955c(0x24c)][_0x1d955c(0x20b)]='0%',_0x10d5bf[_0x1d955c(0x260)]='Buscando\x20proximidad...';}function measureSecretProximity(_0x437a6c,_0x2e6534){const _0x1f6019=_0xc299a;if(!isAdmin)return;const _0x52855c=getSecretTargets(),_0xa6038f=document['getElementById'](_0x1f6019(0x258)),_0x3759c0=document[_0x1f6019(0x27d)](_0x1f6019(0x221)),_0x1068f1=document[_0x1f6019(0x27d)](_0x1f6019(0x24a));if(!_0x52855c['length']){_0xa6038f['textContent']='0%',_0x3759c0[_0x1f6019(0x24c)]['width']='0%',_0x1068f1[_0x1f6019(0x260)]=_0x1f6019(0x268);return;}let _0x24705a=Infinity;_0x52855c[_0x1f6019(0x20f)](_0x1591a5=>{const _0x1b5569=_0x1f6019,_0x5e77d4=_0x1591a5[_0x1b5569(0x252)](),_0x27f6ad=_0x5e77d4['left']+_0x5e77d4[_0x1b5569(0x20b)]/0x2,_0xbd2625=_0x5e77d4[_0x1b5569(0x256)]+_0x5e77d4[_0x1b5569(0x204)]/0x2,_0x3cf1ea=Math['hypot'](_0x437a6c-_0x27f6ad,_0x2e6534-_0xbd2625);_0x24705a=Math['min'](_0x24705a,_0x3cf1ea);});const _0xb30d42=Math[_0x1f6019(0x207)](0x0,Math['min'](0x64,Math[_0x1f6019(0x26b)]((0x1-_0x24705a/0x15e)*0x64)));_0xa6038f['textContent']=_0xb30d42+'%',_0x3759c0[_0x1f6019(0x24c)][_0x1f6019(0x20b)]=_0xb30d42+'%';if(_0xb30d42>=0x50)_0x1068f1[_0x1f6019(0x260)]='¡Muy\x20cerca!';else{if(_0xb30d42>=0x28)_0x1068f1[_0x1f6019(0x260)]=_0x1f6019(0x231);else _0xb30d42>0x0?_0x1068f1['textContent']=_0x1f6019(0x219):_0x1068f1[_0x1f6019(0x260)]=_0x1f6019(0x20d);}}document[_0xc299a(0x212)]('pointermove',_0xa0ed8a=>{const _0x287a51=_0xc299a;if(!isAdmin)return;measureSecretProximity(_0xa0ed8a[_0x287a51(0x26c)],_0xa0ed8a['clientY']);}),document[_0xc299a(0x212)]('pointerdown',_0x4930c4=>{const _0x91411c=_0xc299a;if(!isAdmin)return;measureSecretProximity(_0x4930c4[_0x91411c(0x26c)],_0x4930c4[_0x91411c(0x271)]);});const testButton=document[_0xc299a(0x27d)](_0xc299a(0x262));testButton&&testButton[_0xc299a(0x212)]('click',function(){const _0x38803b=_0xc299a;if(!isAdmin)return;document['getElementById']('jsStatus')[_0x38803b(0x260)]='¡JAVASCRIPT\x20FUNCIONA\x20CORRECTAMENTE!';});window['addEventListener'](_0xc299a(0x285),function(_0x4d6fa1){const _0x1b1319=_0xc299a;if(!isAdmin)return;const _0x3e9394=document['getElementById'](_0x1b1319(0x277));_0x3e9394&&(_0x3e9394[_0x1b1319(0x260)]='ERROR:\x20'+_0x4d6fa1['message']);}),window[_0xc299a(0x1fc)]=show,updateAdmin(),checkSession();

(function(){
  const originalShow = window.show;
  const secretPages = ['secret3','secret3Final'];

  window.show = function(id){
    if(secretPages.includes(id)){
      document.querySelectorAll('.page').forEach(page=>page.classList.remove('active'));
      const target=document.getElementById(id);
      if(target) target.classList.add('active');
      document.body.classList.toggle('secret-mode',false);
      document.body.classList.toggle('secret2-mode',false);
      document.body.classList.toggle('secret3-mode',id==='secret3');
      document.body.classList.toggle('secret3-final-mode',id==='secret3Final');
      if(id==='secret3Final'){
        const message=document.getElementById('secret3FinalMessage');
        if(message) message.style.display='none';
        const returnButton=document.getElementById('secret3Return');
        if(returnButton) returnButton.style.display='none';
      }
      return;
    }
    document.body.classList.remove('secret3-mode','secret3-final-mode');
    if(typeof originalShow==='function') originalShow(id);
  };

  function level2Decoded(){return localStorage.getItem('level2Decoded')==='true';}
  function level2Unlocked(){return localStorage.getItem('level2Unlocked')==='true';}

  window.openLevel2Decode=function(){
    if(level2Decoded()){
      window.show('secret3');
      return;
    }
    const panel=document.getElementById('level2Decode');
    if(panel) panel.style.display='block';
  };

  window.submitLevel2Decode=function(){
    const first=(document.getElementById('base64Answer')?.value||'').trim().toLowerCase();
    const second=(document.getElementById('asciiAnswer')?.value||'').trim().toLowerCase();
    const message=document.getElementById('level2DecodeMessage');
    if(first==='celeste' && second==='octava'){
      localStorage.setItem('level2Decoded','true');
      message.className='secret3-message secret3-success';
      message.textContent='¡Decodificación correcta! La Clasificación 2 está disponible.';
      updateLevel2UI();
      setTimeout(()=>{const panel=document.getElementById('level2Decode');if(panel)panel.style.display='none';},900);
    }else{
      message.className='secret3-message secret3-denied';
      message.textContent='Decodificación incorrecta. Inténtalo de nuevo.';
    }
  };

  window.updateLevel2UI=function(){
    const status=document.getElementById('level2Status');
    if(!status)return;
    if(level2Unlocked()){
      status.className='green';
      status.textContent='Desbloqueado';
      status.onclick=null;
      status.removeAttribute('onclick');
    }else if(level2Decoded()){
      status.className='level2-animated';
      status.textContent='???';
      status.onclick=()=>window.show('secret3');
    }else{
      status.className='red';
      status.textContent='Bloqueado';
      status.onclick=null;
    }
  };

  window.openSecret3Access=function(){
    const panel=document.getElementById('secret3Access');
    if(panel) panel.style.display='block';
  };

  window.submitSecret3Code=function(){
    const value=(document.getElementById('secret3Code')?.value||'').trim();
    const message=document.getElementById('secret3AccessMessage');
    const next=document.getElementById('secret3Next');
    message.style.display='block';
    if(value==='6710'){
      message.className='secret3-message secret3-success';
      message.textContent='Celeste; digo, ¡Felicidades! Has logrado descifrar y completar este secreto; pero te falta una última cosa...';
      next.style.display='block';
    }else{
      message.className='secret3-message secret3-denied';
      message.textContent='Acceso denegado | Nuevo Nivel de Clasificación bloqueado | Intentar de Nuevo.';
      next.style.display='none';
    }
  };

  window.submitSecret3Final=function(){
    const value=(document.getElementById('secret3FinalCode')?.value||'').trim();
    const message=document.getElementById('secret3FinalMessage');
    const returnButton=document.getElementById('secret3Return');
    if(value!=='101080')return;
    const sentence='¡Felicidades! ¡Has logrado descifrar el último secreto del nivel 1! Ahora, puedes reclamar tu siguiente Nivel de Clasificación al tocar el botón de abajo.';
    message.replaceChildren();
    [...sentence].forEach((character,index)=>{
      const span=document.createElement('span');
      span.textContent=character;
      span.style.color=index%2===0?'#fff':'#87cefa';
      span.style.textShadow=index%2===0?'0 0 8px #fff':'0 0 8px #87cefa';
      message.appendChild(span);
    });
    message.style.display='block';
    returnButton.style.display='inline-block';
    localStorage.setItem('level2Unlocked','true');
  };

  window.finishSecret3=function(){
    localStorage.setItem('level2Unlocked','true');
    updateLevel2UI();
    window.show('home');
  };

  updateLevel2UI();
})();

async function restaurarDocumentoPrueba() {
  if (!db || !isAdmin) {
    alert('Acceso administrativo requerido.');
    return;
  }

  if (!confirm('¿Restaurar el documento de prueba?')) return;

  try {
    const { data, error } = await db.functions.invoke(
      'restore-document',
      {
        body: {
          backupRecordId: 'd21d19b8-ef89-4f5f-933b-e5b26cfa73eb'
        }
      }
    );

    if (error) throw error;

    if (!data || !data.success) {
      throw new Error(data?.error || 'Restauración no completada.');
    }

    alert('Documento restaurado correctamente.');
    console.log('Resultado:', data);

    await loadDocs();

  } catch (error) {
    console.error('Error restaurando documento:', error);
    alert('Error de restauración: ' + error.message);
  }
}

async function toggleBackupHistory() {
  if (!isAdmin || !db) {
    alert('Acceso administrativo requerido.');
    return;
  }

  const panel = document.getElementById('backupHistory');
  const list = document.getElementById('backupHistoryList');

  if (panel.style.display === 'block') {
    panel.style.display = 'none';
    return;
  }

  panel.style.display = 'block';
  list.textContent = 'Consultando historial...';

  try {
    const { data, error } = await db.auth.getSession();

    if (error) throw error;

    const session = data?.session;

    if (!session || session.user.id !== ADMIN_UID) {
      throw new Error('Sesión administrativa no válida.');
    }

    const response = await fetch(
      SUPABASE_URL + '/functions/v1/dynamic-handler',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + session.access_token
        },
        body: JSON.stringify({
          action: 'getBackupHistory'
        })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error || 'No se pudo consultar el historial.'
      );
    }

    list.replaceChildren();

    if (!result.history.length) {
      list.textContent = 'Todavía no hay respaldos registrados.';
      return;
    }

    result.history.forEach(backup => {
      const card = document.createElement('div');
      card.className = 'card';

      const name = document.createElement('h3');
      name.textContent = backup.document_name || 'Documento sin nombre';

      const date = document.createElement('p');
      date.textContent = 'Fecha: ' +
        new Date(backup.created_at).toLocaleString();

      const id = document.createElement('small');
      id.textContent = 'ID original: ' +
        backup.original_document_id;

      card.append(name, date, id);

const restoreButton = document.createElement('button');
restoreButton.className = 'blue';
restoreButton.textContent = 'RESTAURAR RESPALDO';
restoreButton.onclick = () => {
  restaurarRespaldo(backup.id, backup.document_name);
};

card.appendChild(restoreButton);

const deleteButton = document.createElement('button');
deleteButton.className = 'blue';
deleteButton.textContent = 'ELIMINAR RESPALDO';
deleteButton.onclick = () => {
  eliminarRespaldo(backup.id, backup.document_name);
};

card.appendChild(deleteButton);
list.appendChild(card);
    });

  } catch (error) {
    console.error('Error consultando historial:', error);
    list.textContent = 'ERROR: ' + error.message;
  }
}

window.toggleBackupHistory = toggleBackupHistory;

async function crearRespaldoGeneral() {
  if (!isAdmin || !db) {
    alert('Acceso administrativo requerido.');
    return;
  }

  const status = document.getElementById('generalBackupStatus');

  if (!confirm(
    '¿Crear respaldos de TODOS los documentos registrados?\n\n' +
    'El proceso se realizará uno por uno.'
  )) return;

  const button = document.querySelector(
    'button[onclick="window.crearRespaldoGeneral()"]'
  );

  button.disabled = true;
  status.textContent = 'Preparando respaldos...';

  const resultados = {
    exitosos: [],
    omitidos: [],
    errores: []
  };

  try {
    const { data: sessionData, error: sessionError } =
      await db.auth.getSession();

    if (sessionError) throw sessionError;

    const session = sessionData?.session;

    if (!session || session.user.id !== ADMIN_UID) {
      throw new Error('Sesión administrativa no válida.');
    }

    const { data: documents, error } = await db
      .from('documents')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!documents || documents.length === 0) {
      status.textContent = 'No hay documentos para respaldar.';
      return;
    }

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];

      status.textContent =
        'Respaldando ' + (i + 1) + ' de ' +
        documents.length + ': ' + doc.name;

      try {
        let response = await fetch(
          SUPABASE_URL + '/functions/v1/dynamic-handler',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_KEY,
              'Authorization': 'Bearer ' + session.access_token
            },
            body: JSON.stringify({
              documentId: doc.id,
              confirmDuplicate: false
            })
          }
        );

        let result = await response.json();

        if (result.confirmationRequired) {
          const confirmed = confirm(
            '"' + doc.name + '" ya tiene ' +
            result.existingCount +
            ' copia(s).\n\n¿Crear otra copia?'
          );

          if (!confirmed) {
            resultados.omitidos.push(doc.name);
            continue;
          }

          response = await fetch(
            SUPABASE_URL + '/functions/v1/dynamic-handler',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + session.access_token
              },
              body: JSON.stringify({
                documentId: doc.id,
                confirmDuplicate: true
              })
            }
          );

          result = await response.json();
        }

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || result.message || 'Respaldo fallido.'
          );
        }

        resultados.exitosos.push(doc.name);

      } catch (error) {
        console.error('Error respaldando ' + doc.name, error);
        resultados.errores.push(
          doc.name + ': ' + error.message
        );
      }
    }

    status.textContent =
      'Proceso terminado. Correctos: ' +
      resultados.exitosos.length +
      ' | Omitidos: ' + resultados.omitidos.length +
      ' | Errores: ' + resultados.errores.length;

    alert(
      'RESPALDO GENERAL TERMINADO\n\n' +
      'Correctos: ' + resultados.exitosos.length +
      '\nOmitidos: ' + resultados.omitidos.length +
      '\nErrores: ' + resultados.errores.length
    );

    console.log('Resultados del respaldo general:', resultados);

    await loadDocs();

  } catch (error) {
    console.error('Error en respaldo general:', error);
    status.textContent = 'ERROR: ' + error.message;

  } finally {
    button.disabled = false;
  }
}

window.crearRespaldoGeneral = crearRespaldoGeneral;

async function restaurarRespaldo(backupRecordId, documentName) {
  if (!isAdmin || !db) {
    alert('Acceso administrativo requerido.');
    return;
  }

  if (!confirm(
    '¿Deseas restaurar el respaldo de "' + documentName + '"?'
  )) return;

  try {
    let { data, error } = await db.functions.invoke(
      'restore-document',
      {
        body: {
          backupRecordId: backupRecordId
        }
      }
    );

    if (error) throw error;

    if (data?.confirmationRequired) {
      const confirmed = confirm(
        'El documento "' + data.documentName +
        '" todavía existe.\n\n' +
        '¿Deseas reemplazar sus archivos actuales con los del respaldo?'
      );

      if (!confirmed) return;

      ({ data, error } = await db.functions.invoke(
        'restore-document',
        {
          body: {
            backupRecordId: backupRecordId,
            confirmReplace: true
          }
        }
      ));

      if (error) throw error;
    }

    if (!data?.success) {
      throw new Error(
        data?.error || 'No se pudo completar la restauración.'
      );
    }

    alert(data.message);
    await loadDocs();

  } catch (error) {
    console.error('Error restaurando respaldo:', error);
    alert('ERROR: ' + error.message);
  }
}

window.restaurarRespaldo = restaurarRespaldo;

async function eliminarRespaldo(backupRecordId, documentName) {
  if (!isAdmin || !db) {
    alert('Acceso administrativo requerido.');
    return;
  }

  const confirmed = confirm(
    '¿Estás seguro de que deseas eliminar el respaldo de "' +
    documentName +
    '"?\n\nEsta acción no eliminará el documento original.'
  );

  if (!confirmed) return;

  try {
    const { data, error } = await db.functions.invoke(
      'dynamic-handler',
      {
        body: {
          action: 'deleteBackup',
          backupRecordId: backupRecordId
        }
      }
    );

    if (error) throw error;

    if (!data?.success) {
      throw new Error(
        data?.error || 'No se pudo eliminar el respaldo.'
      );
    }

    alert(data.message);

    const panel = document.getElementById('backupHistory');
    panel.style.display = 'none';
    await toggleBackupHistory();

  } catch (error) {
    console.error('Error eliminando respaldo:', error);
    alert('ERROR: ' + error.message);
  }
}

window.eliminarRespaldo = eliminarRespaldo;
