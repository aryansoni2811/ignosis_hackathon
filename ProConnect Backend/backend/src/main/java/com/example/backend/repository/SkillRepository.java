package com.example.backend.repository;

import com.example.backend.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByFreelancerId(Long freelancerId);
    List<Skill> findByNameContainingIgnoreCase(String name);
}