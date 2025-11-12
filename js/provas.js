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
  function getAllowRetake(){
    try{
      const raw = localStorage.getItem('provas-allow-retake');
      if(raw === null) return true; // default: allow
      return raw === 'true';
    }catch(e){return true}
  }

  // initialize teacher toggle (if present on page)
  (function initAllowToggle(){
    const el = document.getElementById('allowRetakeToggle');
    if(!el) return;
    try{
      el.checked = getAllowRetake();
      el.addEventListener('change', ()=>{
        localStorage.setItem('provas-allow-retake', el.checked ? 'true' : 'false');
      });
    }catch(e){/* ignore */}
  })();

  let running = false;
  let current = null;
  let index = 0;
  let score = 0;

  window.startTest = function(subject){
    if(running) return;
    // if teacher disallowed retake and this subject was already taken, block
    try{
      if(!getAllowRetake()){
        const taken = localStorage.getItem('provas-taken-' + subject);
        if(taken === 'true'){
          // show previous result instead of alert
          try{
            const raw = localStorage.getItem('provas-results');
            const arr = raw ? JSON.parse(raw) : [];
            const prev = arr.find(r=>r.subject === subject);
            if(prev){
              // show previous result panel (no refazer)
              showPreviousResult(prev);
              return;
            }
          }catch(e){}
          // fallback message
          showSimpleMessage('Refazer esta atividade está desabilitado pelo professor.');
          return;
        }
      }
    }catch(e){}
    const list = QUESTIONS[subject] || [];
    if(!list.length) return alert('Nenhuma questão disponível');
    running = true;
    current = {subject, list, answers: []};
    index = 0; score = 0;
    modalTitle.textContent = 'Simulado — ' + subject;
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
    const result = {subject: current.subject, score, total: current.list.length, percent, date: new Date().toISOString(), answers: current.answers};
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
        <h2>Resultado — ${escapeHtml(res.subject)}</h2>
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

    // append a removable result panel instead of replacing entire modal content
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
      // check teacher setting before restarting
      if(!getAllowRetake()){
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

    // hide/disable rerun if teacher disallowed retake
    try{
      if(!getAllowRetake()){
        if(rerun) { rerun.style.display = 'none'; }
      } else {
        if(rerun) { rerun.style.display = ''; rerun.disabled = false; rerun.title = ''; }
      }
    }catch(e){/* ignore */}

    // abrir revisão em um modal dedicado com navegação, ver-todas e exportar
    viewC && viewC.addEventListener('click', ()=>{
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
    const panel = document.createElement('div');
    panel.className = 'result-panel';
    panel.innerHTML = html;
    modalContent.appendChild(panel);

    const viewC = panel.querySelector('#viewCorrectionsPrev');
    const viewP = panel.querySelector('#viewProgressPrev');
    const closeR = panel.querySelector('#closeResultPrev');

    viewC && viewC.addEventListener('click', ()=>{
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
    const panel = document.createElement('div'); panel.className='result-panel';
    panel.innerHTML = `<div style="padding:12px"><h3>Aviso</h3><div style="margin-top:10px">${escapeHtml(msg)}</div><div style="margin-top:12px;text-align:right"><button class="sidebar-btn" id="closeMsg">Fechar</button></div></div>`;
    modalContent.appendChild(panel);
    const closeBtnMsg = panel.querySelector('#closeMsg'); closeBtnMsg && closeBtnMsg.addEventListener('click', ()=>{ panel.remove(); hideModal(); });
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>\"'`]/g, function(match){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[match]; });
  }
})();
