        let formularios = []; // Lista de todos os formulários
        let formularioAtual = null; // Formulário selecionado para responder
        let perguntas = [];
        let respostas = [];
        let opcoesPerguntaAtual = [];

        window.onload = function() {
            carregarDados();
            initTheme();
        };

        // Funções para tema light/dark
        function initTheme() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeButton();
        }

        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeButton();
        }

        function updateThemeButton() {
            const theme = document.documentElement.getAttribute('data-theme');
            const btn = document.getElementById('themeToggle');
            if (btn) {
                btn.textContent = theme === 'light' ? '🌙' : '☀️';
            }
        }

        // Funções para controlar permissão de múltiplas respostas
        function getAllowMultipleResponses(formId) {
            try {
                const raw = localStorage.getItem(`formulario-allow-multiple-${formId}`);
                if (raw === null) return true;
                return raw === 'true';
            } catch (e) {
                return true;
            }
        }

        function setAllowMultipleResponses(formId, allow) {
            try {
                localStorage.setItem(`formulario-allow-multiple-${formId}`, allow ? 'true' : 'false');
            } catch (e) {}
        }

        function getUserHasResponded(formId) {
            try {
                const raw = localStorage.getItem(`formulario-user-responded-${formId}`);
                return raw === 'true';
            } catch (e) {
                return false;
            }
        }

        function setUserResponded(formId) {
            try {
                localStorage.setItem(`formulario-user-responded-${formId}`, 'true');
            } catch (e) {}
        }

        function clearUserResponded(formId) {
            try {
                localStorage.removeItem(`formulario-user-responded-${formId}`);
            } catch (e) {}
        }

        function getPrazo(formId) {
            try {
                return localStorage.getItem(`formulario-prazo-${formId}`);
            } catch (e) {
                return null;
            }
        }

        function setPrazo(formId, prazo) {
            try {
                if (prazo) {
                    localStorage.setItem(`formulario-prazo-${formId}`, prazo);
                } else {
                    localStorage.removeItem(`formulario-prazo-${formId}`);
                }
            } catch (e) {}
        }

        function getAllowAfterDeadline(formId) {
            try {
                const raw = localStorage.getItem(`formulario-allow-after-deadline-${formId}`);
                return raw === 'true';
            } catch (e) {
                return false;
            }
        }

        function setAllowAfterDeadline(formId, allow) {
            try {
                localStorage.setItem(`formulario-allow-after-deadline-${formId}`, allow ? 'true' : 'false');
            } catch (e) {}
        }

        function isPrazoVencido(formId) {
            const prazo = getPrazo(formId);
            if (!prazo) return false;
            
            const agora = new Date();
            const dataVencimento = new Date(prazo);
            return agora > dataVencimento && !getAllowAfterDeadline(formId);
        }

        function carregarDados() {
            try {
                const formsSalvos = localStorage.getItem('formularios-list');
                if (formsSalvos) {
                    formularios = JSON.parse(formsSalvos);
                }
            } catch (e) {
                formularios = [];
            }
            
            renderizarListaFormularios();
            atualizarContadoresRespostas();
        }

        function mostrarSecao(secao) {
            document.getElementById('secaoCriar').classList.add('hidden');
            document.getElementById('secaoResponder').classList.add('hidden');
            document.getElementById('secaoRespostas').classList.add('hidden');
            document.getElementById('secaoAnalise').classList.add('hidden');

            document.getElementById('btnCriar').classList.remove('active');
            document.getElementById('btnResponder').classList.remove('active');
            document.getElementById('btnRespostas').classList.remove('active');
            document.getElementById('btnAnalise').classList.remove('active');

            if (secao === 'criar') {
                document.getElementById('secaoCriar').classList.remove('hidden');
                document.getElementById('btnCriar').classList.add('active');
                renderizarListaFormularios();
            } else if (secao === 'responder') {
                document.getElementById('secaoResponder').classList.remove('hidden');
                document.getElementById('btnResponder').classList.add('active');
                renderizarSeletorFormularios();
            } else if (secao === 'respostas') {
                document.getElementById('secaoRespostas').classList.remove('hidden');
                document.getElementById('btnRespostas').classList.add('active');
                renderizarTodasRespostas();
            } else if (secao === 'analise') {
                document.getElementById('secaoAnalise').classList.remove('hidden');
                document.getElementById('btnAnalise').classList.add('active');
                renderizarAnalise();
            }
        }

        function renderizarListaFormularios() {
            const container = document.getElementById('secaoCriar');
            
            // Se já existe a lista, só atualiza o conteúdo
            let listaDiv = document.getElementById('listaFormulariosExistentes');
            if (!listaDiv) {
                // Criar estrutura inicial
                const html = `
                    <div style="margin-top:30px;border-top:1px solid #ddd;padding-top:20px;">
                        <h2>Formulários Existentes</h2>
                        <div id="listaFormulariosExistentes"></div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', html);
                listaDiv = document.getElementById('listaFormulariosExistentes');
            }

            if (formularios.length === 0) {
                listaDiv.innerHTML = '<p style="color:#999;text-align:center;padding:20px;">Nenhum formulário criado ainda</p>';
                return;
            }

            listaDiv.innerHTML = formularios.map(f => `
                <div class="pergunta-item" style="margin-bottom:15px;">
                    <div class="pergunta-content">
                        <div class="pergunta-numero">${f.titulo}</div>
                        <div class="pergunta-tipo">${f.perguntas.length} questões • ${new Date(f.dataCriacao).toLocaleString('pt-BR')}</div>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button class="delete-btn" onclick="editarFormulario('${f.id}')" style="background:#667eea;color:white">Editar</button>
                        <button class="delete-btn" onclick="removerFormulario('${f.id}')">Excluir</button>
                    </div>
                </div>
            `).join('');
        }

        function renderizarSeletorFormularios() {
            const container = document.getElementById('formularioResposta');
            
            if (formularios.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <p>Nenhum formulário disponível.</p>
                        <p>O professor precisa criar um formulário primeiro!</p>
                    </div>
                `;
                return;
            }

            let html = `
                <h1>Selecione um Formulário para Responder</h1>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;margin-top:20px;">
            `;

            formularios.forEach(f => {
                const prazo = getPrazo(f.id);
                const vencido = isPrazoVencido(f.id);
                const prazoBorderColor = vencido ? '#ff9800' : '#ddd';
                
                html += `
                    <div class="card" style="cursor:pointer;transition:all 0.3s;border:2px solid ${prazoBorderColor};" onclick="selecionarFormulario('${f.id}')">
                        <h3>${f.titulo}</h3>
                        <p style="color:#666;margin:10px 0;">${f.descricao || 'Sem descrição'}</p>
                        <p style="font-size:12px;color:#999;">${f.perguntas.length} questões</p>
                        ${prazo ? `<p style="font-size:12px;color:${vencido ? '#ff9800' : '#666'};margin-top:10px;">Prazo: ${new Date(prazo).toLocaleString('pt-BR')}</p>` : ''}
                        ${vencido ? `<p style="font-size:12px;color:#ff9800;font-weight:bold;">⚠️ Prazo Vencido</p>` : ''}
                    </div>
                `;
            });

            html += `</div>`;
            container.innerHTML = html;
        }

        function selecionarFormulario(formId) {
            formularioAtual = formularios.find(f => f.id === formId);
            renderizarFormularioResposta();
        }

        function editarFormulario(formId) {
            const form = formularios.find(f => f.id === formId);
            if (!form) return;

            document.getElementById('tituloForm').value = form.titulo;
            document.getElementById('descricaoForm').value = form.descricao || '';
            document.getElementById('allowMultipleResponses').checked = getAllowMultipleResponses(formId);
            
            const prazo = getPrazo(formId);
            if (prazo) {
                document.getElementById('prazoDatalimit').value = prazo;
            }
            document.getElementById('allowAfterDeadline').checked = getAllowAfterDeadline(formId);
            
            perguntas = JSON.parse(JSON.stringify(form.perguntas)); // Deep copy
            renderizarPerguntasAdicionadas();
            
            // Armazenar ID do formulário para edição
            document.getElementById('tituloForm').dataset.editingId = formId;
        }

        function removerFormulario(formId) {
            if (!confirm('Deseja excluir este formulário e todas as suas respostas?')) return;
            
            formularios = formularios.filter(f => f.id !== formId);
            localStorage.setItem('formularios-list', JSON.stringify(formularios));
            
            // Limpar todas as respostas deste formulário
            localStorage.removeItem(`respostas-${formId}`);
            localStorage.removeItem(`formulario-allow-multiple-${formId}`);
            localStorage.removeItem(`formulario-user-responded-${formId}`);
            localStorage.removeItem(`formulario-prazo-${formId}`);
            localStorage.removeItem(`formulario-allow-after-deadline-${formId}`);
            
            renderizarListaFormularios();
            atualizarContadoresRespostas();
        }

        function atualizarTipoPergunta() {
            const tipo = document.getElementById('novaPerguntaTipo').value;
            const container = document.getElementById('opcoesContainer');
            
            if (tipo === 'multipla') {
                container.classList.remove('hidden');
            } else {
                container.classList.add('hidden');
                opcoesPerguntaAtual = [];
                document.getElementById('listaOpcoes').innerHTML = '';
            }
        }

        function adicionarOpcao() {
            opcoesPerguntaAtual.push('');
            renderizarOpcoes();
        }

        function renderizarOpcoes() {
            const container = document.getElementById('listaOpcoes');
            container.innerHTML = '';
            
            opcoesPerguntaAtual.forEach((opcao, index) => {
                const div = document.createElement('div');
                div.className = 'opcao-item';
                div.innerHTML = `
                    <input type="text" value="${opcao}" placeholder="Opção ${index + 1}" 
                           onchange="opcoesPerguntaAtual[${index}] = this.value">
                    <button class="delete-btn" onclick="removerOpcao(${index})">Remover</button>
                `;
                container.appendChild(div);
            });
        }

        function removerOpcao(index) {
            opcoesPerguntaAtual.splice(index, 1);
            renderizarOpcoes();
        }

        function adicionarPergunta() {
            const texto = document.getElementById('novaPerguntaTexto').value.trim();
            const tipo = document.getElementById('novaPerguntaTipo').value;

            if (!texto) {
                alert('Digite o texto da pergunta!');
                return;
            }

            if (tipo === 'multipla' && opcoesPerguntaAtual.filter(o => o.trim()).length === 0) {
                alert('Adicione pelo menos uma opção!');
                return;
            }

            const novaPergunta = {
                id: Date.now(),
                texto: texto,
                tipo: tipo,
                opcoes: tipo === 'multipla' ? opcoesPerguntaAtual.filter(o => o.trim()) : []
            };

            perguntas.push(novaPergunta);
            
            document.getElementById('novaPerguntaTexto').value = '';
            document.getElementById('novaPerguntaTipo').value = 'texto';
            opcoesPerguntaAtual = [];
            document.getElementById('opcoesContainer').classList.add('hidden');
            document.getElementById('listaOpcoes').innerHTML = '';

            renderizarPerguntasAdicionadas();
        }

        function renderizarPerguntasAdicionadas() {
            const container = document.getElementById('listaPerguntasAdicionadas');
            
            if (perguntas.length === 0) {
                container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Nenhuma pergunta adicionada ainda</p>';
                return;
            }

            container.innerHTML = perguntas.map((p, index) => `
                <div class="pergunta-item">
                    <div class="pergunta-content">
                        <div class="pergunta-numero">${index + 1}. ${p.texto}</div>
                        <div class="pergunta-tipo">
                            Tipo: ${p.tipo === 'texto' ? 'Texto' : p.tipo === 'numero' ? 'Número' : 'Múltipla escolha'}
                            ${p.opcoes.length > 0 ? '<br>Opções: ' + p.opcoes.join(', ') : ''}
                        </div>
                    </div>
                    <button class="delete-btn" onclick="removerPergunta(${p.id})">Remover</button>
                </div>
            `).join('');
        }

        function removerPergunta(id) {
            perguntas = perguntas.filter(p => p.id !== id);
            renderizarPerguntasAdicionadas();
        }

        function salvarFormulario() {
            const titulo = document.getElementById('tituloForm').value.trim();
            const descricao = document.getElementById('descricaoForm').value.trim();
            const allowMultiple = document.getElementById('allowMultipleResponses').checked;
            const prazo = document.getElementById('prazoDatalimit').value;
            const allowAfterDeadline = document.getElementById('allowAfterDeadline').checked;
            const editingId = document.getElementById('tituloForm').dataset.editingId;

            if (!titulo) {
                alert('Digite um título para o formulário!');
                return;
            }

            if (perguntas.length === 0) {
                alert('Adicione pelo menos uma pergunta!');
                return;
            }

            const formId = editingId || 'form-' + Date.now();
            let dataCriacao = new Date().toISOString();
            
            // Se está editando, remover versão antiga e guardar data original
            if (editingId) {
                const formOriginal = formularios.find(f => f.id === editingId);
                if (formOriginal) {
                    dataCriacao = formOriginal.dataCriacao;
                }
                formularios = formularios.filter(f => f.id !== editingId);
            }

            const formulario = {
                id: formId,
                titulo: titulo,
                descricao: descricao,
                perguntas: perguntas,
                dataCriacao: dataCriacao
            };

            formularios.unshift(formulario);
            localStorage.setItem('formularios-list', JSON.stringify(formularios));
            setAllowMultipleResponses(formId, allowMultiple);
            if (prazo) {
                setPrazo(formId, prazo);
            }
            setAllowAfterDeadline(formId, allowAfterDeadline);

            alert('Formulário ' + (editingId ? 'atualizado' : 'publicado') + ' com sucesso!');
            
            // Limpar formulário
            document.getElementById('tituloForm').value = '';
            document.getElementById('descricaoForm').value = '';
            document.getElementById('tituloForm').dataset.editingId = '';
            document.getElementById('allowMultipleResponses').checked = true;
            document.getElementById('prazoDatalimit').value = '';
            document.getElementById('allowAfterDeadline').checked = false;
            perguntas = [];
            renderizarPerguntasAdicionadas();
            renderizarListaFormularios();
            mostrarSecao('responder');
        }

        function renderizarFormularioResposta() {
            const container = document.getElementById('formularioResposta');

            if (!formularioAtual) {
                renderizarSeletorFormularios();
                return;
            }

            // Verificar se o prazo venceu
            if (isPrazoVencido(formularioAtual.id)) {
                container.innerHTML = `
                    <div class="resposta-item" style="padding:20px;text-align:center;border-left:4px solid #ff9800">
                        <h2 style="color:#ff9800;margin-bottom:10px">Prazo Encerrado</h2>
                        <p>O prazo para responder este formulário já venceu.</p>
                        <p style="margin-top:10px;color:#666;font-size:14px">Prazo limite: <strong>${new Date(getPrazo(formularioAtual.id)).toLocaleString('pt-BR')}</strong></p>
                        <button class="btn" onclick="voltarSeletorFormularios()" style="margin-top:20px;">← Voltar</button>
                    </div>
                `;
                return;
            }

            // Verificar se o usuário já respondeu e múltiplas respostas não são permitidas
            if (!getAllowMultipleResponses(formularioAtual.id) && getUserHasResponded(formularioAtual.id)) {
                container.innerHTML = `
                    <div class="resposta-item" style="padding:20px;text-align:center;border-left:4px solid #ff6b6b">
                        <h2 style="color:#ff6b6b;margin-bottom:10px">Resposta já enviada</h2>
                        <p>O professor não permite múltiplas respostas para este formulário.</p>
                        <p style="margin-top:10px;color:#666;font-size:14px">Sua resposta foi registrada em: <strong>${new Date().toLocaleString('pt-BR')}</strong></p>
                        <button class="btn" onclick="voltarSeletorFormularios()" style="margin-top:20px;">← Voltar</button>
                    </div>
                `;
                return;
            }

            let html = `
                <div style="border-left: 4px solid #02fa23ff; padding-left: 20px; margin-bottom: 30px;">
                    <h1>${formularioAtual.titulo}</h1>
                    ${formularioAtual.descricao ? `<p class="subtitle">${formularioAtual.descricao}</p>` : ''}
                    ${getPrazo(formularioAtual.id) ? `<p style="color:#ff9800;font-weight:bold;margin-top:10px;">Prazo: ${new Date(getPrazo(formularioAtual.id)).toLocaleString('pt-BR')}</p>` : ''}
                    <button class="btn btn-secondary" onclick="voltarSeletorFormularios()" style="margin-top:15px;">← Voltar</button>
                </div>
                <div id="mensagemEnviado" class="success-message hidden">Resposta enviada com sucesso!</div>
            `;

            formularioAtual.perguntas.forEach((p, index) => {
                html += `<div class="form-group">`;
                html += `<label>${index + 1}. ${p.texto} <span class="required">*</span></label>`;

                if (p.tipo === 'texto') {
                    html += `<textarea id="resp_${p.id}" rows="3" placeholder="Digite sua resposta"></textarea>`;
                } else if (p.tipo === 'numero') {
                    html += `<input type="number" id="resp_${p.id}" placeholder="Digite um número">`;
                } else if (p.tipo === 'multipla') {
                    html += `<div style="display:flex;flex-direction:column;gap:10px;margin-top:10px;">`;
                    p.opcoes.forEach(op => {
                        const idRadio = `resp_${p.id}_${op.replace(/\s+/g, '_')}`;
                        html += `
                            <div style="display:flex;align-items:center;gap:8px;">
                                <input type="radio" id="${idRadio}" name="resp_${p.id}" value="${op}">
                                <label for="${idRadio}" style="margin:0;cursor:pointer;">${op}</label>
                            </div>
                        `;
                    });
                    html += `</div>`;
                }

                html += `</div>`;
            });

            html += `<button class="btn" onclick="enviarResposta()">Enviar Respostas</button>`;

            container.innerHTML = html;
        }

        function voltarSeletorFormularios() {
            formularioAtual = null;
            renderizarSeletorFormularios();
        }

        function enviarResposta() {
            const respostaAtual = {};
            let todasPreenchidas = true;

            formularioAtual.perguntas.forEach(p => {
                let valor = '';
                if (p.tipo === 'multipla') {
                    const radioSelecionado = document.querySelector(`input[name="resp_${p.id}"]:checked`);
                    valor = radioSelecionado ? radioSelecionado.value : '';
                } else {
                    valor = document.getElementById(`resp_${p.id}`).value.trim();
                }
                
                if (!valor) {
                    todasPreenchidas = false;
                }
                respostaAtual[p.id] = valor;
            });

            if (!todasPreenchidas) {
                alert('Por favor, responda todas as perguntas!');
                return;
            }

            const novaResposta = {
                id: Date.now(),
                respostas: respostaAtual,
                dataHora: new Date().toLocaleString('pt-BR')
            };

            // Salvar resposta específica do formulário
            let respostasFormulario = [];
            try {
                const saved = localStorage.getItem(`respostas-${formularioAtual.id}`);
                if (saved) respostasFormulario = JSON.parse(saved);
            } catch (e) {}

            respostasFormulario.push(novaResposta);
            localStorage.setItem(`respostas-${formularioAtual.id}`, JSON.stringify(respostasFormulario));
            
            // Marcar que o usuário respondeu
            if (!getAllowMultipleResponses(formularioAtual.id)) {
                setUserResponded(formularioAtual.id);
            }

            const msgEl = document.getElementById('mensagemEnviado');
            msgEl && msgEl.classList.remove('hidden');
            
            formularioAtual.perguntas.forEach(p => {
                if (p.tipo === 'multipla') {
                    const radioSelecionado = document.querySelector(`input[name="resp_${p.id}"]:checked`);
                    if (radioSelecionado) radioSelecionado.checked = false;
                } else {
                    document.getElementById(`resp_${p.id}`).value = '';
                }
            });

            atualizarContadoresRespostas();

            setTimeout(() => {
                msgEl && msgEl.classList.add('hidden');
                if (!getAllowMultipleResponses(formularioAtual.id)) {
                    renderizarFormularioResposta();
                } else {
                    voltarSeletorFormularios();
                }
            }, 2000);
        }

        function renderizarTodasRespostas() {
            const container = document.getElementById('listaRespostas');
            
            // Verificar se está visualizando respostas de um formulário específico
            const formSelecionadoId = container.dataset.formSelecionadoId;
            
            if (formSelecionadoId) {
                // Mostrar respostas do formulário selecionado
                mostrarRespostasFormulario(formSelecionadoId, container);
            } else {
                // Mostrar lista de formulários para selecionar
                mostrarListaFormulariosRespostas(container);
            }
        }

        function mostrarListaFormulariosRespostas(container) {
            let html = '<h2>Formulários e Respostas</h2>';
            
            if (formularios.length === 0) {
                html += '<p style="color:#999;text-align:center;padding:20px;">Nenhum formulário criado ainda</p>';
                container.innerHTML = html;
                return;
            }

            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;margin-top:20px;">';

            formularios.forEach(form => {
                let formRespostas = [];
                try {
                    const saved = localStorage.getItem(`respostas-${form.id}`);
                    if (saved) formRespostas = JSON.parse(saved);
                } catch (e) {}

                html += `
                    <div class="card" style="cursor:pointer;transition:all 0.3s;padding:20px;border:1px solid #ddd;border-radius:8px;" 
                         onclick="abrirRespostasFormulario('${form.id}')">
                        <h3 style="margin-top:0;color:#333;">${form.titulo}</h3>
                        <p style="color:#666;margin:10px 0;font-size:14px;">${form.descricao || 'Sem descrição'}</p>
                        <div style="background:#f0f0f0;padding:12px;border-radius:4px;text-align:center;margin-top:15px;">
                            <div style="font-size:24px;font-weight:bold;color:#000000;">${formRespostas.length}</div>
                            <div style="color:#666;font-size:13px;">resposta${formRespostas.length !== 1 ? 's' : ''}</div>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            container.innerHTML = html;
            
            // Limpar data attribute
            delete container.dataset.formSelecionadoId;
        }

        function abrirRespostasFormulario(formId) {
            const container = document.getElementById('listaRespostas');
            container.dataset.formSelecionadoId = formId;
            renderizarTodasRespostas();
        }

        function voltarListaRespostas() {
            const container = document.getElementById('listaRespostas');
            delete container.dataset.formSelecionadoId;
            renderizarTodasRespostas();
        }

        function mostrarRespostasFormulario(formId, container) {
            const form = formularios.find(f => f.id === formId);
            if (!form) {
                voltarListaRespostas();
                return;
            }

            let formRespostas = [];
            try {
                const saved = localStorage.getItem(`respostas-${formId}`);
                if (saved) formRespostas = JSON.parse(saved);
            } catch (e) {}

            let html = `
                <div style="margin-bottom:20px;">
                    <button class="btn btn-secondary" onclick="voltarListaRespostas()" style="margin-bottom:20px;">← Voltar</button>
                    <h2>${form.titulo}</h2>
                    <p style="color:#666;">${form.descricao || ''}</p>
                    <div style="background:#f5f5f5;padding:15px;border-radius:4px;margin-top:10px;">
                        <strong>Total de respostas: ${formRespostas.length}</strong>
                    </div>
                </div>
            `;

            if (formRespostas.length === 0) {
                html += '<p style="color:#999;text-align:center;padding:30px;">Nenhuma resposta para este formulário</p>';
            } else {
                formRespostas.forEach(r => {
                    html += `
                        <div class="resposta-item">
                            <div class="resposta-header">
                                <span class="resposta-data">${r.dataHora}</span>
                                <button class="delete-btn" onclick="excluirResposta('${form.id}', ${r.id})">Excluir</button>
                            </div>
                            <div class="resposta-conteudo">
                                ${form.perguntas.map(p => `
                                    <div class="resposta-linha">
                                        <div class="resposta-pergunta">${p.texto}</div>
                                        <div class="resposta-texto">${r.respostas[p.id] || '(sem resposta)'}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                });
            }

            container.innerHTML = html;
        }

        function excluirResposta(formId, respostaId) {
            if (!confirm('Deseja excluir esta resposta?')) return;

            let formRespostas = [];
            try {
                const saved = localStorage.getItem(`respostas-${formId}`);
                if (saved) formRespostas = JSON.parse(saved);
            } catch (e) {}

            formRespostas = formRespostas.filter(r => r.id !== respostaId);
            localStorage.setItem(`respostas-${formId}`, JSON.stringify(formRespostas));
            
            // Limpar flag de resposta do usuário para permitir responder novamente
            clearUserResponded(formId);
            
            renderizarTodasRespostas();
            atualizarContadoresRespostas();
        }

        function atualizarContadoresRespostas() {
            let totalRespostas = 0;
            formularios.forEach(form => {
                try {
                    const saved = localStorage.getItem(`respostas-${form.id}`);
                    if (saved) {
                        const respostas = JSON.parse(saved);
                        totalRespostas += respostas.length;
                    }
                } catch (e) {}
            });
            document.getElementById('contadorRespostas').textContent = totalRespostas;
        }

        function renderizarAnalise() {
            const container = document.getElementById('conteudoAnalise');
            
            container.innerHTML = `
                <div class="resposta-item">
                    <p style="color: #3f3f3fff; text-align: center; padding: 20px;">Análise será exibida aqui</p>
                </div>
            `;
        }

        function exportarCSV() {
            if (respostas.length === 0) {
                alert('Não há respostas para exportar!');
                return;
            }

            const headers = ['Data/Hora', ...perguntas.map(p => p.texto)];
            let csv = headers.join(',') + '\n';

            respostas.forEach(r => {
                const linha = [
                    r.dataHora,
                    ...perguntas.map(p => {
                        const resp = r.respostas[p.id] || '';
                        return `"${String(resp).replace(/"/g, '""')}"`;
                    })
                ];
                csv += linha.join(',') + '\n';
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `respostas_${Date.now()}.csv`;
            // link.click();
        }

        function resetarTudo() {
            if (confirm('Isso vai apagar TUDO (todos os formulários e respostas). Tem certeza?')) {
                localStorage.removeItem('formularios-list');
                
                // Limpar dados de cada formulário
                formularios.forEach(form => {
                    localStorage.removeItem(`respostas-${form.id}`);
                    localStorage.removeItem(`formulario-allow-multiple-${form.id}`);
                    localStorage.removeItem(`formulario-user-responded-${form.id}`);
                    localStorage.removeItem(`formulario-prazo-${form.id}`);
                    localStorage.removeItem(`formulario-allow-after-deadline-${form.id}`);
                });
                
                formularios = [];
                formularioAtual = null;
                perguntas = [];
                document.getElementById('tituloForm').value = '';
                document.getElementById('descricaoForm').value = '';
                document.getElementById('allowMultipleResponses').checked = true;
                document.getElementById('prazoDatalimit').value = '';
                document.getElementById('allowAfterDeadline').checked = false;
                document.getElementById('tituloForm').dataset.editingId = '';
                
                renderizarPerguntasAdicionadas();
                renderizarListaFormularios();
                atualizarContadoresRespostas();
                alert('Tudo foi resetado!');
            }
        }