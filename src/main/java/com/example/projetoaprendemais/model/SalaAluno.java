package com.example.projetoaprendemais.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "salas_alunos")
public class SalaAluno {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sala_id", nullable = false)
    private Long salaId;

    @Column(name = "aluno_id", nullable = false)
    private Long alunoId;

    @Column(name = "data_entrada")
    private LocalDateTime dataEntrada;

    @Column(name = "data_saida")
    private LocalDateTime dataSaida;

    @Column(name = "esta_na_sala", nullable = false)
    private Boolean estaNaSala = false;

    public SalaAluno() {}

    public SalaAluno(Long salaId, Long alunoId) {
        this.salaId = salaId;
        this.alunoId = alunoId;
        this.estaNaSala = true;
        this.dataEntrada = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSalaId() {
        return salaId;
    }

    public void setSalaId(Long salaId) {
        this.salaId = salaId;
    }

    public Long getAlunoId() {
        return alunoId;
    }

    public void setAlunoId(Long alunoId) {
        this.alunoId = alunoId;
    }

    public LocalDateTime getDataEntrada() {
        return dataEntrada;
    }

    public void setDataEntrada(LocalDateTime dataEntrada) {
        this.dataEntrada = dataEntrada;
    }

    public LocalDateTime getDataSaida() {
        return dataSaida;
    }

    public void setDataSaida(LocalDateTime dataSaida) {
        this.dataSaida = dataSaida;
    }

    public Boolean getEstaNaSala() {
        return estaNaSala;
    }

    public void setEstaNaSala(Boolean estaNaSala) {
        this.estaNaSala = estaNaSala;
    }
}
