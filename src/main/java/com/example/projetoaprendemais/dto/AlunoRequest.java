package com.example.projetoaprendemais.dto;

public class AlunoRequest {
    private Long userId;
    private String nome;
    private String ra;
    private String email;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getRa() { return ra; }
    public void setRa(String ra) { this.ra = ra; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
