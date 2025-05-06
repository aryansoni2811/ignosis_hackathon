package com.example.backend.service;


import com.example.backend.entity.SkillStatisticsEntity;
import com.example.backend.repository.SkillStatisticsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class SkillStatisticsService {

    private final SkillStatisticsRepository skillStatisticsRepository;

    public SkillStatisticsService(SkillStatisticsRepository skillStatisticsRepository) {
        this.skillStatisticsRepository = skillStatisticsRepository;
    }

    @Transactional
    public void incrementSkillCount(String skillName) {
        String normalizedSkill = skillName.trim().toLowerCase();

        Optional<SkillStatisticsEntity> existingSkill = skillStatisticsRepository.findBySkillName(normalizedSkill);

        if (existingSkill.isPresent()) {
            SkillStatisticsEntity skill = existingSkill.get();
            skill.setCount(skill.getCount() + 1);
            skillStatisticsRepository.save(skill);
        } else {
            SkillStatisticsEntity newSkill = new SkillStatisticsEntity();
            newSkill.setSkillName(normalizedSkill);
            newSkill.setCount(1);
            skillStatisticsRepository.save(newSkill);
        }
    }
}
