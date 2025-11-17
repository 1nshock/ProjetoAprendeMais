package com.example.projetoaprendemais.dto;

public class RegisterRequest {
    private String username;
    private String password;
    private String passwordConfirm;
    private String tipo; // 'aluno', 'professor', 'instituicao'

    public RegisterRequest() {}

    public RegisterRequest(String username, String password, String passwordConfirm, String tipo) {
        this.username = username;
        this.password = password;
        this.passwordConfirm = passwordConfirm;
        this.tipo = tipo;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPasswordConfirm() {
        return passwordConfirm;
    }

    public void setPasswordConfirm(String passwordConfirm) {
        this.passwordConfirm = passwordConfirm;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
}
