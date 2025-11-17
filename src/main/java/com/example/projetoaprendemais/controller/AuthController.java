package com.example.projetoaprendemais.controller;

import com.example.projetoaprendemais.model.User;
import com.example.projetoaprendemais.model.Professor;
import com.example.projetoaprendemais.model.Aluno;
import com.example.projetoaprendemais.model.Instituicao;
import com.example.projetoaprendemais.service.AuthService;
import com.example.projetoaprendemais.dto.RegisterRequest;
import com.example.projetoaprendemais.dto.ProfessorRequest;
import com.example.projetoaprendemais.dto.AlunoRequest;
import com.example.projetoaprendemais.dto.InstituicaoRequest;
import com.example.projetoaprendemais.repository.ProfessorRepository;
import com.example.projetoaprendemais.repository.AlunoRepository;
import com.example.projetoaprendemais.repository.InstituicaoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {
    private final AuthService authService;
    private final ProfessorRepository professorRepository;
    private final AlunoRepository alunoRepository;
    private final InstituicaoRepository instituicaoRepository;

    public AuthController(AuthService authService, ProfessorRepository professorRepository, 
                        AlunoRepository alunoRepository, InstituicaoRepository instituicaoRepository) {
        this.authService = authService;
        this.professorRepository = professorRepository;
        this.alunoRepository = alunoRepository;
        this.instituicaoRepository = instituicaoRepository;
    }

    public static record LoginRequest(String username, String password) {}
    public static record LoginResponse(boolean ok, Long userId, String username, String tipo) {}
    public static record RegisterResponse(boolean ok, String message, Long userId) {}

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        User u = authService.authenticate(req.username(), req.password());
        if (u == null) {
            return ResponseEntity.status(401).body(new LoginResponse(false, null, null, null));
        }
        return ResponseEntity.ok(new LoginResponse(true, u.getId(), u.getUsername(), u.getTipo()));
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest req) {
        // Validação básica
        if (req.getUsername() == null || req.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new RegisterResponse(false, "Usuário não pode ser vazio", null));
        }
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(new RegisterResponse(false, "Senha deve ter pelo menos 6 caracteres", null));
        }
        if (!req.getPassword().equals(req.getPasswordConfirm())) {
            return ResponseEntity.badRequest().body(new RegisterResponse(false, "Senhas não conferem", null));
        }

        // Tentar registrar
        User newUser = authService.register(req.getUsername(), req.getPassword(), req.getTipo());
        if (newUser == null) {
            return ResponseEntity.badRequest().body(new RegisterResponse(false, "Usuário já existe", null));
        }

        return ResponseEntity.ok(new RegisterResponse(true, "Cadastro realizado com sucesso!", newUser.getId()));
    }

    @PostMapping("/professor")
    public ResponseEntity<String> saveProfessor(@RequestBody ProfessorRequest req) {
        try {
            Professor prof = new Professor();
            prof.setUserId(req.getUserId());
            prof.setNome(req.getNome());
            prof.setCpf(req.getCpf());
            prof.setEmail(req.getEmail());
            prof.setInstituicao(req.getInstituicao());
            prof.setCodigoDocente(req.getCodigoDocente());
            professorRepository.save(prof);
            return ResponseEntity.ok("Professor salvo com sucesso!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao salvar professor: " + e.getMessage());
        }
    }

    @PostMapping("/aluno")
    public ResponseEntity<String> saveAluno(@RequestBody AlunoRequest req) {
        try {
            Aluno aluno = new Aluno();
            aluno.setUserId(req.getUserId());
            aluno.setNome(req.getNome());
            aluno.setRa(req.getRa());
            aluno.setEmail(req.getEmail());
            alunoRepository.save(aluno);
            return ResponseEntity.ok("Aluno salvo com sucesso!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao salvar aluno: " + e.getMessage());
        }
    }

    @PostMapping("/instituicao")
    public ResponseEntity<String> saveInstituicao(@RequestBody InstituicaoRequest req) {
        try {
            Instituicao inst = new Instituicao();
            inst.setUserId(req.getUserId());
            inst.setNomeUnidade(req.getNomeUnidade());
            inst.setCodigo(req.getCodigo());
            inst.setCnpj(req.getCnpj());
            inst.setTipoInstituicao(req.getTipoInstituicao());
            inst.setCep(req.getCep());
            inst.setNumero(req.getNumero());
            inst.setTelefone(req.getTelefone());
            inst.setEmailContato(req.getEmailContato());
            instituicaoRepository.save(inst);
            return ResponseEntity.ok("Instituição salva com sucesso!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao salvar instituição: " + e.getMessage());
        }
    }
}
