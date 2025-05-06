package com.example.backend.repository;

import com.example.backend.entity.FinancialSettings;
import com.example.backend.entity.Freelancer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FinancialSettingsRepository extends JpaRepository<FinancialSettings, Long> {
    Optional<FinancialSettings> findByFreelancer(Freelancer freelancer);
}