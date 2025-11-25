package com.example.projetoaprendemais.repository;

import com.example.projetoaprendemais.model.Instituicao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InstituicaoRepository extends JpaRepository<Instituicao, Long> {
    @Query("SELECT i FROM Instituicao i WHERE i.userId = :userId")
    Instituicao findByUserId(@Param("userId") Long userId);
}
