package com.example.projetoaprendemais.repository;

import com.example.projetoaprendemais.model.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, Long> {
    @Query("SELECT a FROM Aluno a WHERE a.userId = :userId")
    Aluno findByUserId(@Param("userId") Long userId);
}
