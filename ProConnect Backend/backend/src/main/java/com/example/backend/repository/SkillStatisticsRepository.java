package com.example.backend.repository;

import com.example.backend.entity.SkillStatisticsEntity;
import com.example.backend.entity.SkillStatisticsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// SkillStatisticsRepository.java
public interface SkillStatisticsRepository extends JpaRepository<SkillStatisticsEntity, Long> {
    Optional<SkillStatisticsEntity> findBySkillName(String skillName);
    List<SkillStatisticsEntity> findAllByOrderByCountDesc();
}