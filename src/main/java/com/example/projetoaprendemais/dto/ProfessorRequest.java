package com.example.projetoaprendemais.dto;

public class ProfessorRequest {
    private Long userId;
    private String nome;
    private String cpf;
    private String email;
    private String instituicao;
    private String codigoDocente;

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
