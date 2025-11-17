// Simples fluxo de prova: pequenas questões em memória e resultados no localStorage
(function(){
  const modal = document.getElementById('testModal');
  const closeBtn = document.getElementById('closeTest');
  const questionArea = document.getElementById('questionArea');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');
  const nextBtn = document.getElementById('nextBtn');

  const QUESTIONS = {
    portugues: [
      {q:'Qual a forma correta?', opts:['Houveram erros','Houve erros'], a:1},
      {q:'Assinale a alternativa com crase:', opts:['Vou a festa','Vou à festa'], a:1},
      {q:'Verbo no infinitivo:', opts:['Cantar','Cantarei'], a:0}
    ],
    matematica: [
      {q:'2+2=?', opts:['3','4','5'], a:1},
      {q:'Raiz quadrada de 9:', opts:['2','3','4'], a:1},
      {q:'10/2 =', opts:['5','2','8'], a:0}
    ],
    geral: [
      {q:'Capital do Brasil?', opts:['Brasília','Rio'], a:0},
      {q:'Cor do céu em dia claro?', opts:['Azul','Verde'], a:0}
    ]
  };

  // teacher setting: allow students to retake activities
  // Supports a global flag `provas-allow-retake` and optional per-subject flags
  // `provas-allow-retake-<subject>` which override the global setting when present.
  function getAllowRetake(subject){
    try{
      if(subject){
        const rawSub = localStorage.getItem('provas-allow-retake-' + subject);
        if(rawSub !== null) return rawSub === 'true';
      }
      const raw = localStorage.getItem('provas-allow-retake');
      if(raw === null) return false; // default: do NOT allow retake
      return raw === 'true';
    }catch(e){return false}
  }

  // initialize teacher toggles (global and per-subject if present on the page)
  (function initAllowToggle(){
    // global toggle (id=allowRetakeToggle)
    const globalEl = document.getElementById('allowRetakeToggle');
    if(globalEl){
      try{
        globalEl.checked = getAllowRetake();
        globalEl.addEventListener('change', ()=>{
          localStorage.setItem('provas-allow-retake', globalEl.checked ? 'true' : 'false');
        });
      }catch(e){}
    }

    // per-subject toggles: add elements with attribute `data-allow-retake-subject="<subject>"`
    try{
      const perEls = document.querySelectorAll('[data-allow-retake-subject]');
      perEls.forEach(el=>{
        const subject = el.getAttribute('data-allow-retake-subject');
        try{
          el.checked = getAllowRetake(subject);
          el.addEventListener('change', ()=>{
            localStorage.setItem('provas-allow-retake-' + subject, el.checked ? 'true' : 'false');
          });
        }catch(e){}
      });
    }catch(e){}
    
    // per-subject view-answers toggles: attribute `data-view-answers-subject="<subject>"`
    try{
      const viewEls = document.querySelectorAll('[data-view-answers-subject]');
      viewEls.forEach(el=>{
        const subject = el.getAttribute('data-view-answers-subject');
        try{
          el.checked = getAllowViewAnswers(subject);
          el.addEventListener('change', ()=>{
            localStorage.setItem('provas-allow-view-' + subject, el.checked ? 'true' : 'false');
          });
        }catch(e){}
      });
    }catch(e){}
  })();

  // teacher setting: allow students to view corrections/answers per-activity
  // Checks `provas-allow-view-<subject>` in localStorage; default: false (don't show)
  function getAllowViewAnswers(subject){
    try{
      if(!subject) return false;
      const raw = localStorage.getItem('provas-allow-view-' + subject);
      if(raw === null) return false;
      return raw === 'true';
    }catch(e){return false}
  }

  let running = false;
  let current = null;
  let index = 0;
  let score = 0;

  // activity storage helpers
  function loadActivities(){
    try{ const raw = localStorage.getItem('provas-activities'); return raw ? JSON.parse(raw) : []; }catch(e){return []}
  }
  function saveActivities(arr){ try{ localStorage.setItem('provas-activities', JSON.stringify(arr)); }catch(e){}
  }
  function renderActivities(){
    const container = document.getElementById('customActivities');
    if(!container) return;
    // remove previously rendered custom cards (to avoid duplicates/overlap)
    Array.from(container.querySelectorAll('[data-custom="true"]')).forEach(n=>n.remove());
    const activities = loadActivities();
    activities.forEach(a=>{
      const card = document.createElement('div'); card.className='card-simulado'; card.setAttribute('data-custom','true');
      const footer = document.createElement('div'); footer.className='card-footer-actions';
      const left = document.createElement('div'); left.innerHTML = `<div><h3>${escapeHtml(a.title)}</h3><p>${(a.questions||[]).length} questões</p></div>`;
      const actions = document.createElement('div'); actions.style.display='flex'; actions.style.gap='8px'; actions.style.alignItems='center';
      const startBtn = document.createElement('button'); startBtn.className='sidebar-btn primary-action btn-pill'; startBtn.textContent='Iniciar'; startBtn.addEventListener('click', ()=> startTest(a.id));
      const editBtn = document.createElement('button'); editBtn.className='sidebar-btn secondary btn-pill'; editBtn.textContent='Editar'; editBtn.addEventListener('click', ()=> { window.openCreateModal && window.openCreateModal(a); });
      const delBtn = document.createElement('button'); delBtn.className='sidebar-btn secondary btn-pill'; delBtn.textContent='Excluir'; delBtn.addEventListener('click', ()=>{
        if(!confirm('Excluir atividade "'+ (a.title || a.id) +'"?')) return;
        const list = loadActivities(); const idx = list.findIndex(x=>x.id===a.id); if(idx>=0) { list.splice(idx,1); saveActivities(list); renderActivities(); }
      });
      actions.appendChild(startBtn); actions.appendChild(editBtn); actions.appendChild(delBtn);
      footer.appendChild(actions);
      card.appendChild(left);
      card.appendChild(footer);
      container.appendChild(card);
    });
  }

  // create activity modal wiring
  (function initCreateActivity(){
    const openBtn = document.getElementById('openCreateActivity');
    const modalCreate = document.getElementById('createActivityModal');
    const closeCreate = document.getElementById('closeCreateActivity');
    const addQ = document.getElementById('addQuestionBtn');
    const saveBtn = document.getElementById('saveActivityBtn');
    const qContainer = document.getElementById('questionsContainer');
    const titleInput = document.getElementById('activityTitle');
    const keyInput = document.getElementById('activityKey');
    const allowRetake = document.getElementById('activityAllowRetake');
    const allowView = document.getElementById('activityAllowView');

    function open(){ if(modalCreate) modalCreate.style.display='flex'; }
    function close(){ if(modalCreate) modalCreate.style.display='none'; }

    if(openBtn) openBtn.addEventListener('click', ()=>{ 
      // Reset form for new activity
      titleInput.value = '';
      keyInput.value = '';
      allowRetake.checked = false;
      allowView.checked = false;
      renderQuestionBlocks(); 
      open(); 
    });
    if(closeCreate) closeCreate.addEventListener('click', ()=>{ close(); });

    function makeQuestionBlock(q){
      const wrap = document.createElement('div'); wrap.className='question-block'; wrap.style.padding='8px'; wrap.style.borderBottom='1px solid rgba(0,0,0,0.06)';
      const qid = 'q-' + Date.now() + '-' + Math.random().toString(36).slice(2);
      wrap.dataset.qid = qid;
      wrap.innerHTML = `
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
          <strong>Q</strong>
          <select class="q-type" style="width:180px;padding:6px;border-radius:6px;margin-left:6px">
            <option value="mc">Múltipla escolha</option>
            <option value="tf">Verdadeiro / Falso</option>
          </select>
          <input type="text" class="q-text" placeholder="Enunciado" style="flex:1;padding:6px;margin-left:8px" value="${q && escapeHtml(q.q) || ''}" />
        </div>
        <div class="opts" style="display:flex;flex-direction:column;gap:6px">
        </div>
        <div style="margin-top:6px;display:flex;gap:8px;justify-content:flex-end"><button class="add-opt sidebar-btn">+ Opção</button><button class="remove-q sidebar-btn">Remover</button></div>
      `;
      const optsDiv = wrap.querySelector('.opts');
      const typeEl = wrap.querySelector('.q-type');
      // set initial type from data if provided
      if(q && q.type === 'tf') typeEl.value = 'tf';
      wrap.dataset.qtype = typeEl.value;

      function addOpt(val, isCorrect, fixed){
        const oWrap = document.createElement('div'); oWrap.style.display='flex'; oWrap.style.gap='8px'; oWrap.style.alignItems='center';
        const radio = document.createElement('input'); radio.type='radio'; radio.name='correct-'+ wrap.dataset.qid; radio.className='opt-correct';
        const input = document.createElement('input'); input.type='text'; input.className='opt-text'; input.placeholder='Opção'; input.style.flex='1'; input.value = val||'';
        const del = document.createElement('button'); del.type = 'button'; del.className = 'opt-del sidebar-btn'; del.title = 'Remover esta opção'; del.textContent = '✖';

        if(fixed){
          // fixed options (used for Verdadeiro/Falso): make readonly and hide delete
          input.readOnly = true;
          del.style.display = 'none';
        }

        // delete only this option (if more than 1 option remains)
        del.addEventListener('click', ()=>{
          const currentOpts = Array.from(optsDiv.querySelectorAll('.opt-text'));
          if(currentOpts.length <= 2){
            alert('A questão precisa ter ao menos 2 opções.');
            return;
          }
          oWrap.remove();
        });

        oWrap.appendChild(radio); oWrap.appendChild(input); oWrap.appendChild(del);
        optsDiv.appendChild(oWrap);
        if(isCorrect) radio.checked = true;
        return oWrap;
      }

      // initial options: if TF, create fixed Verd/Fal options, otherwise use provided opts or two blanks
      if(typeEl.value === 'tf'){
        const correctIndex = (q && typeof q.a === 'number') ? q.a : 0;
        addOpt('Verdadeiro', correctIndex === 0, true);
        addOpt('Falso', correctIndex === 1, true);
        wrap.querySelector('.add-opt').style.display = 'none';
      } else if(q && q.opts && q.opts.length){
        q.opts.forEach((oo,i)=> addOpt(oo, i===q.a));
      } else { addOpt(''); addOpt(''); }

      // when question type changes, rebuild options accordingly
      typeEl.addEventListener('change', ()=>{
        wrap.dataset.qtype = typeEl.value;
        optsDiv.innerHTML = '';
        if(typeEl.value === 'tf'){
          addOpt('Verdadeiro', true, true);
          addOpt('Falso', false, true);
          wrap.querySelector('.add-opt').style.display = 'none';
        } else {
          addOpt(''); addOpt('');
          wrap.querySelector('.add-opt').style.display = '';
        }
      });

      wrap.querySelector('.add-opt').addEventListener('click', ()=> addOpt(''));
      wrap.querySelector('.remove-q').addEventListener('click', ()=> wrap.remove());
      return wrap;
    }

    function renderQuestionBlocks(existing){ qContainer.innerHTML=''; (existing||[]).forEach(q=> qContainer.appendChild(makeQuestionBlock(q))); if(!(existing && existing.length)) qContainer.appendChild(makeQuestionBlock()); }

    if(addQ) addQ.addEventListener('click', ()=>{ qContainer.appendChild(makeQuestionBlock()); });

    if(saveBtn) saveBtn.addEventListener('click', ()=>{
      const title = (titleInput && titleInput.value || '').trim();
      if(!title) return alert('Informe o título da atividade');
      let key = (keyInput && keyInput.value || '').trim();
      if(!key) key = 'act-'+Date.now();
      // ensure unique id (or update existing)
      const activities = loadActivities();
      const existingIndex = activities.findIndex(a=>a.id===key);
      if(existingIndex === -1){ if(activities.find(a=>a.id===key)) key = key + '-' + Date.now(); }
      // collect questions
      const qblocks = Array.from(qContainer.querySelectorAll('.question-block'));
      const questions = [];
      for(const pb of qblocks){
        const qtxt = (pb.querySelector('.q-text').value || '').trim();
        const qtype = (pb.querySelector('.q-type') && pb.querySelector('.q-type').value) ? pb.querySelector('.q-type').value : 'mc';
        const optEls = Array.from(pb.querySelectorAll('.opt-text'));
        const radios = Array.from(pb.querySelectorAll('.opt-correct'));
        const optInputs = [];
        let correct = -1;
        for(let i=0;i<optEls.length;i++){
          const v = (optEls[i].value||'').trim();
          if(v.length){
            // if the radio corresponding to this input is checked, mark correct as the index in the filtered list
            if(radios[i] && radios[i].checked) correct = optInputs.length;
            optInputs.push(v);
          } else {
            // if radio was checked for an empty input, force incorrect (will fail validation below)
            if(radios[i] && radios[i].checked) correct = -1;
          }
        }
        // validation: question text + at least 2 options + one correct
        if(!qtxt){ return alert('Cada questão precisa ter um enunciado.'); }
        if(optInputs.length < 2){ return alert('Cada questão precisa ter pelo menos 2 opções preenchidas.'); }
        if(correct < 0 || correct >= optInputs.length){ return alert('Marque a opção correta em cada questão.'); }
        const qobj = { q: qtxt, opts: optInputs, a: correct };
        if(qtype === 'tf') qobj.type = 'tf';
        questions.push(qobj);
      }
      if(questions.length === 0) return alert('Adicione ao menos uma questão.');

      const activity = { id: key, title, questions };
      if(existingIndex >= 0){ activities[existingIndex] = activity; }
      else { activities.unshift(activity); }
      saveActivities(activities);
      // save flags
      try{ localStorage.setItem('provas-allow-retake-' + key, (allowRetake && allowRetake.checked) ? 'true' : 'false'); }catch(e){}
      try{ localStorage.setItem('provas-allow-view-' + key, (allowView && allowView.checked) ? 'true' : 'false'); }catch(e){}
      // re-render activities and close
      renderActivities();
      if(modalCreate) modalCreate.style.display='none';
    });

    // expose a helper to open the create modal with a given activity object (for editing/builtin preview)
    window.openCreateModal = function(activity){
      if(!modalCreate) return;
      titleInput.value = activity.title || '';
      keyInput.value = activity.id || '';
      try{ allowRetake.checked = getAllowRetake(activity.id); }catch(e){ allowRetake.checked = false }
      try{ allowView.checked = getAllowViewAnswers(activity.id); }catch(e){ allowView.checked = false }
      renderQuestionBlocks(activity.questions || []);
      modalCreate.style.display = 'flex';
    };

    // helper that builds an activity object from built-in QUESTIONS and opens the modal
    window.openCreateModalFor = function(subject){
      const qlist = (QUESTIONS && QUESTIONS[subject]) ? QUESTIONS[subject].map(q=>({ q: q.q, opts: q.opts.slice(), a: q.a })) : [];
      const title = (subject === 'portugues') ? 'Simulado de Português' : (subject === 'matematica' ? 'Simulado de Matemática' : (subject === 'geral' ? 'Simulado Geral' : subject));
      const act = { id: subject, title, questions: qlist };
      window.openCreateModal(act);
    };

    // initial render
    renderActivities();
  })();

  window.startTest = function(subject){
    if(running) return;
    // support activities created by teacher (stored in localStorage)
    let subjectKey = subject;
    let activity = null;
    try{ const acts = loadActivities(); activity = acts.find(a=>a.id === subject); }catch(e){}
    let list = [];
    let displayTitle = subject;
    if(activity){
      subjectKey = activity.id;
      list = activity.questions || [];
      displayTitle = activity.title || subjectKey;
    } else {
      list = QUESTIONS[subject] || [];
      displayTitle = subject;
    }

    // if teacher disallowed retake and this subject was already taken, block
    try{
      if(!getAllowRetake(subjectKey)){
        const taken = localStorage.getItem('provas-taken-' + subjectKey);
        if(taken === 'true'){
          try{
            const raw = localStorage.getItem('provas-results');
            const arr = raw ? JSON.parse(raw) : [];
            const prev = arr.find(r=>r.subject === subjectKey);
            if(prev){ showPreviousResult(prev); return; }
          }catch(e){}
          showSimpleMessage('Refazer esta atividade está desabilitado pelo professor.');
          return;
        }
      }
    }catch(e){}

    if(!list.length) return alert('Nenhuma questão disponível');
    running = true;
    current = { subject: subjectKey, list: list, answers: [], title: displayTitle };
    index = 0; score = 0;
    modalTitle.textContent = 'Simulado — ' + displayTitle;
    showModal();
    renderQuestion();
  }

  function renderQuestion(){
    const q = current.list[index];
    questionArea.innerHTML = '';
    const qEl = document.createElement('div');
    qEl.innerHTML = '<strong>Q' + (index+1) + '.</strong> ' + q.q;
    questionArea.appendChild(qEl);
    const opts = document.createElement('div');
    opts.style.marginTop = '12px';
    q.opts.forEach((o,i)=>{
      const btn = document.createElement('button');
      btn.className = 'sidebar-btn';
      btn.style.display='block';
      btn.style.margin='8px 0';
      btn.textContent = o;
      btn.onclick = ()=> select(i);
      opts.appendChild(btn);
    });
    questionArea.appendChild(opts);
    nextBtn.style.display = 'none';
  }

  function select(i){
    const q = current.list[index];
    // save user's answer for the report
    current.answers.push({ q: q.q, opts: q.opts.slice(), chosen: i, correct: q.a });
    if(i === q.a) score++;
    index++;
    if(index >= current.list.length){
      finish();
    } else {
      renderQuestion();
    }
  }

  function finish(){
    const percent = Math.round((score / current.list.length) * 100);
    hideModal();
    running=false;
    const result = {subject: current.subject, title: current.title, score, total: current.list.length, percent, date: new Date().toISOString(), answers: current.answers};
    saveResult(result);
    // mostrar resultado elegante dentro do modal (inclui opção de ver correções)
    showResult(result);
  }

  function saveResult(r){
    try{
      const raw = localStorage.getItem('provas-results');
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift(r);
      localStorage.setItem('provas-results', JSON.stringify(arr.slice(0,30)));
      // mark this subject as taken (used when teacher disables retakes)
      try{ localStorage.setItem('provas-taken-' + r.subject, 'true'); }catch(e){}
    }catch(e){console.error(e)}
  }

  function showModal(){ modal.style.display = 'flex'; }
  function hideModal(){ modal.style.display = 'none'; }
  closeBtn.addEventListener('click', ()=>{ hideModal(); running=false; });
  nextBtn.addEventListener('click', ()=>{ index++; if(index>=current.list.length) finish(); else renderQuestion(); });
  
  // renderiza painel de resultado dentro do modal
  function showResult(res){
    // re-open modal if closed
    modal.style.display = 'flex';
    const html = `
      <div class="test-result" style="padding:12px 0 6px">
        <h2>Resultado — ${escapeHtml(res.title || res.subject)}</h2>
        <div style="display:flex;gap:18px;align-items:center;margin-top:12px;flex-wrap:wrap">
          <div style="min-width:120px;text-align:center">
            <div style="font-size:36px;font-weight:700">${res.percent}%</div>
            <div style="font-size:13px;color:#6b7280">Acertos: ${res.score}/${res.total}</div>
          </div>
          <div style="flex:1">
            <div style="height:12px;background:rgba(0,0,0,0.08);border-radius:999px;overflow:hidden">
              <div style="width:${res.percent}%;height:100%;background:linear-gradient(90deg,#ff8b4a,#ff4b00)"></div>
            </div>
            <div style="margin-top:10px;color:#6b7280;font-size:13px">Suas respostas foram salvas e aparecerão no painel de progresso.</div>
          </div>
        </div>
        <div style="margin-top:18px;display:flex;gap:10px;justify-content:flex-end">
          <button id="rerunTest" class="sidebar-btn">Refazer</button>
          <button id="viewCorrections" class="sidebar-btn">Ver Correções</button>
          <button id="viewProgress" class="sidebar-btn primary-action">Ver Progresso</button>
          <button id="closeResult" class="sidebar-btn">Fechar</button>
        </div>
        <div id="correctionsList" style="display:none;margin-top:14px;max-height:320px;overflow:auto;padding-right:8px"></div>
      </div>
    `;

    // remove any existing result panels so we replace instead of append
    try{
      const existing = modalContent.querySelectorAll('.result-panel');
      existing.forEach(e=>e.remove());
    }catch(e){}

    // append a removable result panel
    const panel = document.createElement('div');
    panel.className = 'result-panel';
    panel.innerHTML = html;
    modalContent.appendChild(panel);

  // hookup buttons (scoped to the newly created panel)
    const rerun = panel.querySelector('#rerunTest');
    const closeR = panel.querySelector('#closeResult');
    const viewP = panel.querySelector('#viewProgress');
  const viewC = panel.querySelector('#viewCorrections');
  const correctionsList = panel.querySelector('#correctionsList');

    rerun && rerun.addEventListener('click', ()=>{
      // check teacher setting before restarting (per-subject)
      if(!getAllowRetake(res.subject)){
        // optionally provide feedback
        rerun.disabled = true;
        rerun.title = 'Refazer está desabilitado pelo professor';
        return;
      }
      // remove panel and reiniciar o mesmo teste
      panel.remove();
      hideModal();
      // small delay to ensure modal hidden and DOM state reset
      setTimeout(()=> startTest(res.subject), 150);
    });

    closeR && closeR.addEventListener('click', ()=>{
      panel.remove();
      hideModal();
    });

    // navegar para a página de progresso ao clicar (mantendo remoção do painel)
    viewP && viewP.addEventListener('click', ()=>{ panel.remove(); hideModal(); window.location.href = 'progresso.html'; });

    // hide/disable rerun if teacher disallowed retake (per-subject)
    try{
      if(!getAllowRetake(res.subject)){
        if(rerun) { rerun.style.display = 'none'; }
      } else {
        if(rerun) { rerun.style.display = ''; rerun.disabled = false; rerun.title = ''; }
      }
    }catch(e){/* ignore */}

    // hide/disable "Ver Correções" if teacher disallowed viewing answers for this subject
    try{
      if(!getAllowViewAnswers(res.subject)){
        if(viewC) { viewC.style.display = 'none'; }
      } else {
        if(viewC) { viewC.style.display = ''; }
      }
    }catch(e){/* ignore */}

    // abrir revisão em um modal dedicado com navegação, ver-todas e exportar
    viewC && viewC.addEventListener('click', ()=>{
      // verify permission per-subject
      if(!getAllowViewAnswers(res.subject)){
        showSimpleMessage('Visualização das respostas está desabilitada pelo professor para esta atividade.');
        return;
      }
      // if modal already exists, just toggle visibility
      let reviewModal = document.getElementById('reviewModal');
      if(!reviewModal){
        reviewModal = document.createElement('div');
        reviewModal.id = 'reviewModal';
        reviewModal.className = 'modal review-modal';
        reviewModal.style.display = 'none';
        reviewModal.innerHTML = `
          <div class="review-modal-content">
            <div class="review-header" style="display:flex;justify-content:space-between;align-items:center">
              <strong id="reviewTitle">Revisão</strong>
              <div style="display:flex;gap:8px">
                <button id="exportCorrections" class="sidebar-btn">Exportar</button>
                <button id="copyCorrections" class="sidebar-btn">Copiar</button>
                <button id="reviewClose" class="sidebar-btn">Fechar</button>
              </div>
            </div>
            <div id="reviewBody" class="review-body" style="margin-top:12px"></div>
                <div class="review-footer" style="display:flex;justify-content:flex-start;align-items:center;margin-top:12px">
                  <div>
                    <button id="prevQ" class="sidebar-btn">Anterior</button>
                    <button id="nextQ" class="sidebar-btn">Próxima</button>
                  </div>
                </div>
          </div>
        `;
        document.body.appendChild(reviewModal);

        // wire up controls (delegated later when opening)
      }

      // ensure only one modal open at a time
      const isOpen = reviewModal.style.display === 'flex';
      if(isOpen){ reviewModal.style.display = 'none'; return; }

      // populate and open modal
      const title = reviewModal.querySelector('#reviewTitle');
      const body = reviewModal.querySelector('#reviewBody');
      const closeR = reviewModal.querySelector('#reviewClose');
      const prevBtn = reviewModal.querySelector('#prevQ');
      const nextBtnR = reviewModal.querySelector('#nextQ');
  // const toggleAllBtn = reviewModal.querySelector('#toggleAll');
      const exportBtn = reviewModal.querySelector('#exportCorrections');
      const copyBtn = reviewModal.querySelector('#copyCorrections');

      title.textContent = 'Revisão — ' + res.subject;

      // state for review modal
      let reviewIndex = 0;
      let showAll = false;

      function renderSingle(i){
        const a = res.answers && res.answers[i];
        if(!a) { body.innerHTML = '<div style="padding:12px;color:#6b7280">Questão não encontrada.</div>'; return; }
        body.innerHTML = '';
        const card = document.createElement('div'); card.className='review-card';
        const q = document.createElement('div'); q.className='review-question'; q.innerHTML = '<strong>Q'+(i+1)+'.</strong> '+escapeHtml(a.q);
        card.appendChild(q);
        const opts = document.createElement('div'); opts.className='review-options';
        if(a.chosen === a.correct){
          const opt = document.createElement('div'); opt.className='option correct'; opt.textContent = a.opts[a.correct]||''; opts.appendChild(opt);
        } else {
          a.opts.forEach((t,idx)=>{ const opt = document.createElement('div'); opt.className='option'; opt.textContent = t; if(idx===a.correct) opt.classList.add('correct'); if(idx===a.chosen && idx!==a.correct) opt.classList.add('wrong'); opts.appendChild(opt); });
        }
        card.appendChild(opts);
        body.appendChild(card);
      }

      // render all questions in the review body
      function renderAll(){
        body.innerHTML = '';
        const all = res.answers || [];
        if(!all.length){
          body.innerHTML = '<div style="padding:12px;color:#6b7280">Nenhuma resposta registrada.</div>';
          return;
        }
        all.forEach((a,idx)=>{
          const card = document.createElement('div'); card.className='review-card';
          const q = document.createElement('div'); q.className='review-question'; q.innerHTML = '<strong>Q'+(idx+1)+'.</strong> '+escapeHtml(a.q);
          card.appendChild(q);
          const opts = document.createElement('div'); opts.className='review-options';
          if(a.chosen === a.correct){
            const opt = document.createElement('div'); opt.className='option correct'; opt.textContent = a.opts[a.correct]||''; opts.appendChild(opt);
          } else {
            a.opts.forEach((t,i)=>{ const opt = document.createElement('div'); opt.className='option'; opt.textContent = t; if(i===a.correct) opt.classList.add('correct'); if(i===a.chosen && i!==a.correct) opt.classList.add('wrong'); opts.appendChild(opt); });
          }
          card.appendChild(opts);
          body.appendChild(card);
        });
      }

      

      function exportCorrections(){
        const data = JSON.stringify(res, null, 2);
        const blob = new Blob([data], {type:'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'correcao-'+(res.subject||'simulado')+'-'+(new Date(res.date).toISOString().slice(0,19).replace(/[:T]/g,'-'))+'.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      }

      function copyCorrections(){
        const lines = [];
        lines.push('Revisão — '+res.subject+' — '+res.date);
        (res.answers||[]).forEach((a,idx)=>{ lines.push('\nQ'+(idx+1)+': '+a.q); a.opts.forEach((o,i)=>{ const mark = (i===a.correct? '✔' : (i===a.chosen? '✖':'')); lines.push('  '+(i+1)+') '+o+' '+mark); }); });
        navigator.clipboard && navigator.clipboard.writeText(lines.join('\n')).then(()=>{/*copied*/}).catch(()=>{});
      }

  prevBtn.addEventListener('click', ()=>{ reviewIndex = Math.max(0, reviewIndex-1); renderSingle(reviewIndex); });
  nextBtnR.addEventListener('click', ()=>{ reviewIndex = Math.min((res.answers||[]).length-1, reviewIndex+1); renderSingle(reviewIndex); });
      exportBtn.addEventListener('click', exportCorrections);
      copyBtn.addEventListener('click', copyCorrections);
      closeR.addEventListener('click', ()=>{ reviewModal.style.display = 'none'; });

  // initial render: always show all questions
  reviewIndex = 0;
  // render all by default and hide single-nav buttons
  renderAll();
  if(prevBtn) prevBtn.style.display = 'none';
  if(nextBtnR) nextBtnR.style.display = 'none';
  reviewModal.style.display = 'flex';
    });
  }

  // show a previous result when retakes are disabled (no refazer option)
  function showPreviousResult(res){
    modal.style.display = 'flex';
    const html = `
      <div class="test-result" style="padding:12px 0 6px">
        <h2>Resultado — ${escapeHtml(res.subject)}</h2>
        <div style="display:flex;gap:18px;align-items:center;margin-top:12px;flex-wrap:wrap">
          <div style="min-width:120px;text-align:center">
            <div style="font-size:36px;font-weight:700">${res.percent}%</div>
            <div style="font-size:13px;color:#6b7280">Acertos: ${res.score}/${res.total}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:6px">Tentativa: ${new Date(res.date).toLocaleString()}</div>
          </div>
          <div style="flex:1">
            <div style="height:12px;background:rgba(0,0,0,0.08);border-radius:999px;overflow:hidden">
              <div style="width:${res.percent}%;height:100%;background:linear-gradient(90deg,#ff8b4a,#ff4b00)"></div>
            </div>
            <div style="margin-top:10px;color:#6b7280;font-size:13px">Refazer está desabilitado pelo professor. Veja abaixo seu resultado salvo.</div>
          </div>
        </div>
        <div style="margin-top:18px;display:flex;gap:10px;justify-content:flex-end">
          <button id="viewCorrectionsPrev" class="sidebar-btn">Ver Correções</button>
          <button id="viewProgressPrev" class="sidebar-btn primary-action">Ver Progresso</button>
          <button id="closeResultPrev" class="sidebar-btn">Fechar</button>
        </div>
      </div>
    `;
    // remove previous panels to avoid stacking multiple results
    try{ const existing = modalContent.querySelectorAll('.result-panel'); existing.forEach(e=>e.remove()); }catch(e){}
    const panel = document.createElement('div');
    panel.className = 'result-panel';
    panel.innerHTML = html;
    modalContent.appendChild(panel);

    const viewC = panel.querySelector('#viewCorrectionsPrev');
    const viewP = panel.querySelector('#viewProgressPrev');
    const closeR = panel.querySelector('#closeResultPrev');

    // hide/show "Ver Correções" depending on per-subject permission
    try{
      if(!getAllowViewAnswers(res.subject)){
        if(viewC) viewC.style.display = 'none';
      } else {
        if(viewC) viewC.style.display = '';
      }
    }catch(e){}

    viewC && viewC.addEventListener('click', ()=>{
      // verify permission per-subject
      if(!getAllowViewAnswers(res.subject)){
        showSimpleMessage('Visualização das respostas está desabilitada pelo professor para esta atividade.');
        return;
      }
      // reuse existing review modal logic by calling the same handler as showResult used
      // create a temporary result object if needed
      // show corrections in the review modal
      // mimic clicking the viewCorrections button inside showResult: create review modal directly
      // reuse code path by calling the same event used earlier: build review modal from res
      // For simplicity, call the same internal block that viewC used in showResult
      // Create review modal if not exists
      let reviewModal = document.getElementById('reviewModal');
      if(!reviewModal){
        // replicate minimal modal creation
        reviewModal = document.createElement('div');
        reviewModal.id = 'reviewModal';
        reviewModal.className = 'modal review-modal';
        reviewModal.style.display = 'none';
        reviewModal.innerHTML = `
          <div class="review-modal-content">
            <div class="review-header" style="display:flex;justify-content:space-between;align-items:center">
              <strong id="reviewTitle">Revisão</strong>
              <div style="display:flex;gap:8px">
                <button id="exportCorrections" class="sidebar-btn">Exportar</button>
                <button id="copyCorrections" class="sidebar-btn">Copiar</button>
                <button id="reviewClose" class="sidebar-btn">Fechar</button>
              </div>
            </div>
            <div id="reviewBody" class="review-body" style="margin-top:12px"></div>
            <div class="review-footer" style="display:flex;justify-content:flex-start;align-items:center;margin-top:12px">
              <div>
                <button id="prevQ" class="sidebar-btn">Anterior</button>
                <button id="nextQ" class="sidebar-btn">Próxima</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(reviewModal);
      }
      // populate and show all
      const title = reviewModal.querySelector('#reviewTitle');
      const body = reviewModal.querySelector('#reviewBody');
      const closeR = reviewModal.querySelector('#reviewClose');
      const exportBtn = reviewModal.querySelector('#exportCorrections');
      const copyBtn = reviewModal.querySelector('#copyCorrections');

      title.textContent = 'Revisão — ' + res.subject;
      // renderAll
      body.innerHTML = '';
      (res.answers || []).forEach((a, idx)=>{
        const card = document.createElement('div'); card.className='review-card';
        const q = document.createElement('div'); q.className='review-question'; q.innerHTML = '<strong>Q'+(idx+1)+'.</strong> '+escapeHtml(a.q);
        card.appendChild(q);
        const opts = document.createElement('div'); opts.className='review-options';
        if(a.chosen === a.correct){ const opt = document.createElement('div'); opt.className='option correct'; opt.textContent = a.opts[a.correct]||''; opts.appendChild(opt); }
        else { a.opts.forEach((t,i)=>{ const opt = document.createElement('div'); opt.className='option'; opt.textContent = t; if(i===a.correct) opt.classList.add('correct'); if(i===a.chosen && i!==a.correct) opt.classList.add('wrong'); opts.appendChild(opt); }); }
        card.appendChild(opts);
        body.appendChild(card);
      });

      exportBtn && exportBtn.addEventListener('click', ()=>{ const data = JSON.stringify(res, null, 2); const blob = new Blob([data], {type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'correcao-'+(res.subject||'simulado')+'.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); });
      copyBtn && copyBtn.addEventListener('click', ()=>{ const lines=[]; lines.push('Revisão — '+res.subject+' — '+res.date); (res.answers||[]).forEach((a,idx)=>{ lines.push('\nQ'+(idx+1)+': '+a.q); a.opts.forEach((o,i)=>{ const mark = (i===a.correct? '✔' : (i===a.chosen? '✖':'')); lines.push('  '+(i+1)+') '+o+' '+mark); }); }); navigator.clipboard && navigator.clipboard.writeText(lines.join('\n')).catch(()=>{}); });
      closeR && closeR.addEventListener('click', ()=>{ reviewModal.style.display = 'none'; });
      reviewModal.style.display = 'flex';
    });

    viewP && viewP.addEventListener('click', ()=>{ panel.remove(); hideModal(); window.location.href = 'progresso.html'; });
    closeR && closeR.addEventListener('click', ()=>{ panel.remove(); hideModal(); });
  }

  // simple inline message panel (fallback)
  function showSimpleMessage(msg){
    modal.style.display = 'flex';
    // replace any existing result/message panels
    try{ const existing = modalContent.querySelectorAll('.result-panel'); existing.forEach(e=>e.remove()); }catch(e){}
    const panel = document.createElement('div'); panel.className='result-panel';
    panel.innerHTML = `<div style="padding:12px"><h3>Aviso</h3><div style="margin-top:10px">${escapeHtml(msg)}</div><div style="margin-top:12px;text-align:right"><button class="sidebar-btn" id="closeMsg">Fechar</button></div></div>`;
    modalContent.appendChild(panel);
    const closeBtnMsg = panel.querySelector('#closeMsg'); closeBtnMsg && closeBtnMsg.addEventListener('click', ()=>{ panel.remove(); hideModal(); });
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>\"'`]/g, function(match){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[match]; });
  }
})();
