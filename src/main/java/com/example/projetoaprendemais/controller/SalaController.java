package com.example.projetoaprendemais.controller;

import com.example.projetoaprendemais.dto.SalaRequest;
import com.example.projetoaprendemais.model.Sala;
import com.example.projetoaprendemais.service.SalaService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/salas")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class SalaController {
    private final SalaService salaService;

    public SalaController(SalaService salaService) {
        this.salaService = salaService;
    }

    @GetMapping
    public List<Sala> listarSalas() {
        return salaService.listarSalas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obterSala(@PathVariable Long id) {
        try {
            Sala sala = salaService.obterSala(id);
            return ResponseEntity.ok(sala);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> criarSala(@RequestBody SalaRequest request, HttpSession session) {
        try {
            Long usuarioId = (Long) session.getAttribute("usuarioId");
            if (usuarioId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Usuario nao autenticado"));
            }

            request.setProfessorId(usuarioId);
            Sala sala = salaService.criarSala(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(sala);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarSala(@PathVariable Long id, @RequestBody SalaRequest request, HttpSession session) {
        try {
            Long usuarioId = (Long) session.getAttribute("usuarioId");
            if (usuarioId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Usuario nao autenticado"));
            }

            Sala salaAtual = salaService.obterSala(id);
            if (!salaAtual.getProfessorId().equals(usuarioId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Apenas o professor pode atualizar esta sala"));
            }

            request.setProfessorId(usuarioId);
            Sala sala = salaService.atualizarSala(id, request);
            return ResponseEntity.ok(sala);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removerSala(@PathVariable Long id, HttpSession session) {
        try {
            Long usuarioId = (Long) session.getAttribute("usuarioId");
            if (usuarioId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Usuario nao autenticado"));
            }

            Sala salaAtual = salaService.obterSala(id);
            if (!salaAtual.getProfessorId().equals(usuarioId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Apenas o professor pode remover esta sala"));
            }

            salaService.removerSala(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/{id}/entrar")
    public ResponseEntity<?> entrarSala(@PathVariable Long id, HttpSession session) {
        try {
            Long usuarioId = (Long) session.getAttribute("usuarioId");
            if (usuarioId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Usuario nao autenticado. Faca login para entrar em uma sala"));
            }

            String tipoUsuario = (String) session.getAttribute("tipoUsuario");
            if (tipoUsuario == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Tipo de usuario nao encontrado na sessao"));
            }

            Sala sala = salaService.entrarSala(id, usuarioId, tipoUsuario);
            return ResponseEntity.ok(sala);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/{id}/sair")
    public ResponseEntity<?> sairSala(@PathVariable Long id, HttpSession session) {
        try {
            Long usuarioId = (Long) session.getAttribute("usuarioId");
            if (usuarioId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Usuario nao autenticado"));
            }

            Sala sala = salaService.sairSala(id, usuarioId);
            return ResponseEntity.ok(sala);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/{id}/alunos")
    public ResponseEntity<?> listarAlunosSala(@PathVariable Long id, HttpSession session) {
        try {
            Long usuarioId = (Long) session.getAttribute("usuarioId");
            if (usuarioId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Usuario nao autenticado"));
            }

            Sala salaAtual = salaService.obterSala(id);
            if (!salaAtual.getProfessorId().equals(usuarioId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Apenas o professor pode ver os alunos da sala"));
            }

            var alunos = salaService.listarAlunosSala(id);
            return ResponseEntity.ok(alunos);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        }
    }
}
