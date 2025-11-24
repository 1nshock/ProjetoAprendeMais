package com.example.projetoaprendemais.service;

import com.example.projetoaprendemais.dto.SalaRequest;
import com.example.projetoaprendemais.model.Sala;
import com.example.projetoaprendemais.model.SalaAluno;
import com.example.projetoaprendemais.repository.SalaRepository;
import com.example.projetoaprendemais.repository.SalaAlunoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SalaService {
    private final SalaRepository salaRepository;
    private final SalaAlunoRepository salaAlunoRepository;

    public SalaService(SalaRepository salaRepository, SalaAlunoRepository salaAlunoRepository) {
        this.salaRepository = salaRepository;
        this.salaAlunoRepository = salaAlunoRepository;
    }

    @Transactional(readOnly = true)
    public List<Sala> listarSalas() {
        return salaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Sala obterSala(Long id) {
        return salaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sala nao encontrada"));
    }

    @Transactional
    public Sala criarSala(SalaRequest request) {
        validarSala(request, null);

        Sala sala = new Sala();
        aplicarDados(sala, request);
        return salaRepository.save(sala);
    }

    @Transactional
    public Sala atualizarSala(Long id, SalaRequest request) {
        Sala existente = obterSala(id);
        validarSala(request, existente);

        aplicarDados(existente, request);
        return salaRepository.save(existente);
    }

    @Transactional
    public void removerSala(Long id) {
        if (!salaRepository.existsById(id)) {
            throw new EntityNotFoundException("Sala nao encontrada");
        }
        salaRepository.deleteById(id);
    }

    @Transactional
    public Sala entrarSala(Long salaId, Long usuarioId, String tipoUsuario) {
        Sala sala = obterSala(salaId);

        if ("professor".equalsIgnoreCase(tipoUsuario) && sala.getProfessorId().equals(usuarioId)) {
            throw new IllegalArgumentException("Professor nao pode entrar em sua propria sala");
        }

        // Para alunos: verificar se já está na sala
        if ("aluno".equalsIgnoreCase(tipoUsuario)) {
            var jaEstaNaSala = salaAlunoRepository.findBySalaIdAndAlunoIdAndEstaNaSalaTrue(salaId, usuarioId);
            if (jaEstaNaSala.isPresent()) {
                throw new IllegalArgumentException("Voce ja esta nesta sala");
            }

            // Verificar capacidade
            if (sala.getCapacidadeAtual() >= sala.getCapacidadeMaxima()) {
                throw new IllegalArgumentException("Sala cheia");
            }

            // Registrar entrada
            SalaAluno salaAluno = new SalaAluno(salaId, usuarioId);
            salaAlunoRepository.save(salaAluno);
        }

        sala.setCapacidadeAtual(sala.getCapacidadeAtual() + 1);
        return salaRepository.save(sala);
    }

    @Transactional
    public Sala sairSala(Long salaId, Long usuarioId) {
        Sala sala = obterSala(salaId);

        // Encontrar registro do aluno na sala
        var salaAluno = salaAlunoRepository.findBySalaIdAndAlunoIdAndEstaNaSalaTrue(salaId, usuarioId);
        
        if (salaAluno.isPresent()) {
            SalaAluno registro = salaAluno.get();
            registro.setEstaNaSala(false);
            registro.setDataSaida(LocalDateTime.now());
            salaAlunoRepository.save(registro);
        }

        if (sala.getCapacidadeAtual() > 0) {
            sala.setCapacidadeAtual(sala.getCapacidadeAtual() - 1);
        }

        return salaRepository.save(sala);
    }

    @Transactional(readOnly = true)
    public List<SalaAluno> listarAlunosSala(Long salaId) {
        obterSala(salaId); // Valida se sala existe
        return salaAlunoRepository.findBySalaIdAndEstaNaSalaTrue(salaId);
    }

    private void validarSala(SalaRequest request, Sala existente) {
        if (request == null) {
            throw new IllegalArgumentException("Dados da sala sao obrigatorios");
        }

        String nome = request.getNome() == null ? null : request.getNome().trim();
        if (nome == null || nome.isEmpty()) {
            throw new IllegalArgumentException("Nome da sala nao pode ser vazio");
        }

        Integer capacidadeMaxima = request.getCapacidadeMaxima();
        if (capacidadeMaxima == null || capacidadeMaxima <= 0) {
            throw new IllegalArgumentException("Capacidade maxima deve ser maior que zero");
        }

        Integer capacidadeAtual = request.getCapacidadeAtual();
        if (capacidadeAtual != null && (capacidadeAtual < 0 || capacidadeAtual > capacidadeMaxima)) {
            throw new IllegalArgumentException("Capacidade atual deve estar entre 0 e a capacidade maxima");
        }

        if (request.getProfessorId() == null || request.getProfessorId() <= 0) {
            throw new IllegalArgumentException("Professor ID eh obrigatorio");
        }

        boolean nomeAlterado = existente == null || !existente.getNome().equalsIgnoreCase(nome);
        if (nomeAlterado && salaRepository.existsByNomeIgnoreCase(nome)) {
            throw new IllegalArgumentException("Ja existe uma sala com esse nome");
        }
    }

    private void aplicarDados(Sala sala, SalaRequest request) {
        sala.setNome(request.getNome().trim());
        sala.setDescricao(request.getDescricao());
        sala.setCapacidadeMaxima(request.getCapacidadeMaxima());

        Integer capacidadeAtual = request.getCapacidadeAtual();
        sala.setCapacidadeAtual(capacidadeAtual != null ? capacidadeAtual : sala.getCapacidadeAtual());
        if (sala.getCapacidadeAtual() == null) {
            sala.setCapacidadeAtual(0);
        }

        sala.setSenha(request.getSenha());
        sala.setProfessorId(request.getProfessorId());
    }
}
