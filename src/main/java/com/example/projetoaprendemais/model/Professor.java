package com.example.projetoaprendemais.model;

import jakarta.persistence.*;

@Entity
@Table(name = "professores")
public class Professor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = true)
    private String nome;

    @Column(nullable = true)
    private String cpf;

    @Column(nullable = true)
    private String email;

    private String instituicao;
    private String codigoDocente;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getInstituicao() { return instituicao; }
    public void setInstituicao(String instituicao) { this.instituicao = instituicao; }

    public String getCodigoDocente() { return codigoDocente; }
    public void setCodigoDocente(String codigoDocente) { this.codigoDocente = codigoDocente; }
}
