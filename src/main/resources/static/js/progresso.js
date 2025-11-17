(function(){
  function loadResults(){
    try{
      const raw = localStorage.getItem('provas-results');
      return raw ? JSON.parse(raw) : [];
    }catch(e){return []}
  }

  function render(){
    const list = loadResults();
    const attempts = document.getElementById('attemptsList');
    const summaryText = document.getElementById('summaryText');
    const summaryBar = document.getElementById('summaryBar');
    const barPort = document.getElementById('barPort');
    const barMath = document.getElementById('barMath');
    const barGen = document.getElementById('barGen');

    if(!attempts) return;
    attempts.innerHTML = '';
    if(list.length === 0){
      summaryText.textContent = 'Nenhuma tentativa registrada.';
      summaryBar.style.width = '6%';
      return;
    }

    // geral
    const avg = Math.round(list.reduce((s,r)=>s+(r.percent||0),0)/list.length);
    summaryText.textContent = avg + '% média em ' + list.length + ' tentativas';
    summaryBar.style.width = avg + '%';

    // por matéria simples (média dos últimos 10 por matéria)
    const group = {};
    list.forEach(r=>{ group[r.subject]=group[r.subject]||[]; group[r.subject].push(r.percent||0); });
    function avgOf(arr){ if(!arr||!arr.length) return 0; return Math.round(arr.slice(0,10).reduce((a,b)=>a+b,0)/arr.length); }
    barPort.style.width = (group.portugues?avgOf(group.portugues):0)+'%';
    barMath.style.width = (group.matematica?avgOf(group.matematica):0)+'%';
    barGen.style.width = (group.geral?avgOf(group.geral):0)+'%';

    list.slice(0,20).forEach(r=>{
      const el = document.createElement('div');
      el.className = 'attempt';
      const subj = document.createElement('strong');
      subj.textContent = (r.title || r.subject || '—');
      el.appendChild(subj);
      el.appendChild(document.createTextNode(' — ' + (r.percent||0) + '%'));
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = new Date(r.date).toLocaleString();
      el.appendChild(meta);
      attempts.appendChild(el);
    });
  }

  document.addEventListener('DOMContentLoaded', render);
})();
