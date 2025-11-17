package com.example.projetoaprendemais.model;

import jakarta.persistence.*;

@Entity
@Table(name = "instituicoes")
public class Instituicao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = true)
    private String nomeUnidade;

    @Column(nullable = true)
    private String codigo;

    @Column(nullable = true)
    private String cnpj;

    private String tipoInstituicao;
    private String cep;
    private String numero;
    private String telefone;
    private String emailContato;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getNomeUnidade() { return nomeUnidade; }
    public void setNomeUnidade(String nomeUnidade) { this.nomeUnidade = nomeUnidade; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

    public String getTipoInstituicao() { return tipoInstituicao; }
    public void setTipoInstituicao(String tipoInstituicao) { this.tipoInstituicao = tipoInstituicao; }

    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }

    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getEmailContato() { return emailContato; }
    public void setEmailContato(String emailContato) { this.emailContato = emailContato; }
}
