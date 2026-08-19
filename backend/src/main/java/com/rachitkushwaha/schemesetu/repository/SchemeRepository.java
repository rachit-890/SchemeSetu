package com.rachitkushwaha.schemesetu.repository;

import com.rachitkushwaha.schemesetu.entity.Scheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchemeRepository extends JpaRepository<Scheme, Long> {
    List<Scheme> findByStatus(String status);
}
