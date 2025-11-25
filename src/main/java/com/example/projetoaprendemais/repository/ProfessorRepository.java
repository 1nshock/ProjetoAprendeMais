package com.example.projetoaprendemais.repository;

import com.example.projetoaprendemais.model.Professor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfessorRepository extends JpaRepository<Professor, Long> {
    @Query("SELECT p FROM Professor p WHERE p.userId = :userId")
    Professor findByUserId(@Param("userId") Long userId);
}
