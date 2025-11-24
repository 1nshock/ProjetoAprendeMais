package com.example.projetoaprendemais.repository;

import com.example.projetoaprendemais.model.SalaAluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalaAlunoRepository extends JpaRepository<SalaAluno, Long> {
    Optional<SalaAluno> findBySalaIdAndAlunoIdAndEstaNaSalaTrue(Long salaId, Long alunoId);
    
    Optional<SalaAluno> findBySalaIdAndAlunoId(Long salaId, Long alunoId);
    
    List<SalaAluno> findBySalaIdAndEstaNaSalaTrue(Long salaId);
    
    long countBySalaIdAndEstaNaSalaTrue(Long salaId);
}
