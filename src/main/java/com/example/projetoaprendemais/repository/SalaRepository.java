package com.example.projetoaprendemais.repository;

import com.example.projetoaprendemais.model.Sala;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SalaRepository extends JpaRepository<Sala, Long> {
    boolean existsByNomeIgnoreCase(String nome);
}
