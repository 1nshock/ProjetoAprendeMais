        let formulario = null;
        let perguntas = [];
        let respostas = [];
        let opcoesPerguntaAtual = [];

        window.onload = function() {
            carregarDados();
        };

        // Funções para controlar permissão de múltiplas respostas
        function getAllowMultipleResponses() {
            try {
                const raw = localStorage.getItem('formulario-allow-multiple-responses');
                if (raw === null) return true; // default: permitir múltiplas respostas
                return raw === 'true';
            } catch (e) {
                return true;
            }
        }

        function setAllowMultipleResponses(allow) {
            try {
                localStorage.setItem('formulario-allow-multiple-responses', allow ? 'true' : 'false');
            } catch (e) {}
        }

        function getUserHasResponded() {
            try {
                const raw = localStorage.getItem('formulario-user-responded');
                return raw === 'true';
            } catch (e) {
                return false;
            }
        }

        function setUserResponded() {
            try {
                localStorage.setItem('formulario-user-responded', 'true');
            } catch (e) {}
        }

        function carregarDados() {
            const formSalvo = localStorage.getItem('formulario-config');
            if (formSalvo) {
                formulario = JSON.parse(formSalvo);
                perguntas = formulario.perguntas;
                document.getElementById('tituloForm').value = formulario.titulo;
                document.getElementById('descricaoForm').value = formulario.descricao || '';
                try {
                    document.getElementById('allowMultipleResponses').checked = getAllowMultipleResponses();
                } catch (e) {}
                renderizarPerguntasAdicionadas();
                renderizarFormularioResposta();
                mostrarSecao('responder');
            }

            const respostasSalvas = localStorage.getItem('respostas-formulario');
            if (respostasSalvas) {
                respostas = JSON.parse(respostasSalvas);
            }
            
            atualizarContadorRespostas();
            renderizarRespostas();
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
            } else if (secao === 'responder') {
                document.getElementById('secaoResponder').classList.remove('hidden');
                document.getElementById('btnResponder').classList.add('active');
                renderizarFormularioResposta();
            } else if (secao === 'respostas') {
                document.getElementById('secaoRespostas').classList.remove('hidden');
                document.getElementById('btnRespostas').classList.add('active');
                renderizarRespostas();
            } else if (secao === 'analise') {
                document.getElementById('secaoAnalise').classList.remove('hidden');
                document.getElementById('btnAnalise').classList.add('active');
                renderizarAnalise();
            }
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

            if (!titulo) {
                alert('Digite um título para o formulário!');
                return;
            }

            if (perguntas.length === 0) {
                alert('Adicione pelo menos uma pergunta!');
                return;
            }

            formulario = {
                titulo: titulo,
                descricao: descricao,
                perguntas: perguntas,
                dataCriacao: new Date().toLocaleString('pt-BR')
            };

            localStorage.setItem('formulario-config', JSON.stringify(formulario));
            setAllowMultipleResponses(allowMultiple);
            alert('Formulário publicado com sucesso! Agora qualquer pessoa pode responder.');
            mostrarSecao('responder');
        }

        function renderizarFormularioResposta() {
            const container = document.getElementById('formularioResposta');

            if (!formulario) {
                container.innerHTML = `
                    <div class="empty-state">
                        <p>Nenhum formulário criado ainda.</p>
                        <p>Clique em "Criar/Editar" para começar!</p>
                    </div>
                `;
                return;
            }

            // Verificar se o usuário já respondeu e múltiplas respostas não são permitidas
            if (!getAllowMultipleResponses() && getUserHasResponded()) {
                container.innerHTML = `
                    <div class="resposta-item" style="padding:20px;text-align:center;border-left:4px solid #ff6b6b">
                        <h2 style="color:#ff6b6b;margin-bottom:10px">Resposta já enviada</h2>
                        <p>O professor não permite múltiplas respostas para este formulário.</p>
                        <p style="margin-top:10px;color:#666;font-size:14px">Sua resposta foi registrada em: <strong>${new Date().toLocaleString('pt-BR')}</strong></p>
                    </div>
                `;
                return;
            }

            let html = `
                <div style="border-left: 4px solid #02fa23ff; padding-left: 20px; margin-bottom: 30px;">
                    <h1>${formulario.titulo}</h1>
                    ${formulario.descricao ? `<p class="subtitle">${formulario.descricao}</p>` : ''}
                </div>
                <div id="mensagemEnviado" class="success-message hidden">Resposta enviada com sucesso!</div>
            `;

            perguntas.forEach((p, index) => {
                html += `<div class="form-group">`;
                html += `<label>${index + 1}. ${p.texto} <span class="required">*</span></label>`;

                if (p.tipo === 'texto') {
                    html += `<textarea id="resp_${p.id}" rows="3" placeholder="Digite sua resposta"></textarea>`;
                } else if (p.tipo === 'numero') {
                    html += `<input type="number" id="resp_${p.id}" placeholder="Digite um número">`;
                } else if (p.tipo === 'multipla') {
                    // Usar radio buttons para aceitar apenas uma resposta
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

        function enviarResposta() {
            const respostaAtual = {};
            let todasPreenchidas = true;

            perguntas.forEach(p => {
                let valor = '';
                if (p.tipo === 'multipla') {
                    // Pegar valor do radio button selecionado
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

            respostas.push(novaResposta);
            localStorage.setItem('respostas-formulario', JSON.stringify(respostas));
            
            // Marcar que o usuário respondeu (se múltiplas respostas não forem permitidas)
            if (!getAllowMultipleResponses()) {
                setUserResponded();
            }

            document.getElementById('mensagemEnviado').classList.remove('hidden');
            
            perguntas.forEach(p => {
                if (p.tipo === 'multipla') {
                    const radioSelecionado = document.querySelector(`input[name="resp_${p.id}"]:checked`);
                    if (radioSelecionado) radioSelecionado.checked = false;
                } else {
                    document.getElementById(`resp_${p.id}`).value = '';
                }
            });

            atualizarContadorRespostas();

            setTimeout(() => {
                document.getElementById('mensagemEnviado').classList.add('hidden');
                if (!getAllowMultipleResponses()) {
                    renderizarFormularioResposta(); // Atualizar para mostrar mensagem de já respondido
                }
            }, 3000);
        }

        function renderizarRespostas() {
            const container = document.getElementById('listaRespostas');

            if (respostas.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"/>
                            <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z"/>
                            <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z"/>
                        </svg>
                        <p>Nenhuma resposta ainda</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = respostas.map(r => `
                <div class="resposta-item">
                    <div class="resposta-header">
                        <span class="resposta-data">${r.dataHora}</span>
                        <button class="delete-btn" onclick="excluirResposta(${r.id})">Excluir</button>
                    </div>
                    <div class="resposta-conteudo">
                        ${perguntas.map(p => `
                            <div class="resposta-linha">
                                <div class="resposta-pergunta">${p.texto}</div>
                                <div class="resposta-texto">${r.respostas[p.id] || '(sem resposta)'}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }

        function excluirResposta(id) {
            if (confirm('Deseja excluir esta resposta?')) {
                respostas = respostas.filter(r => r.id !== id);
                localStorage.setItem('respostas-formulario', JSON.stringify(respostas));
                renderizarRespostas();
                atualizarContadorRespostas();
            }
        }

        function atualizarContadorRespostas() {
            document.getElementById('contadorRespostas').textContent = respostas.length;
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
            if (confirm('Isso vai apagar TUDO (formulário e respostas). Tem certeza?')) {
                localStorage.removeItem('formulario-config');
                localStorage.removeItem('respostas-formulario');
                localStorage.removeItem('formulario-allow-multiple-responses');
                localStorage.removeItem('formulario-user-responded');
                formulario = null;
                perguntas = [];
                respostas = [];
                opcoesPerguntaAtual = [];
                document.getElementById('tituloForm').value = '';
                document.getElementById('descricaoForm').value = '';
                renderizarPerguntasAdicionadas();
                atualizarContadorRespostas();
                alert('Tudo foi resetado!');
            }
        }
