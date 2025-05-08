package com.example.backend.repository;

import com.example.backend.entity.ApplicationTracking;
import com.example.backend.entity.ApplicationTracking;
import com.example.backend.entity.Freelancer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ApplicationTrackingRepository extends JpaRepository<ApplicationTracking, Long> {
    @Query("SELECT a.skill, COUNT(a) as total, SUM(CASE WHEN a.won = true THEN 1 ELSE 0 END) as won " +
            "FROM ApplicationTracking a WHERE a.freelancer.id = :freelancerId GROUP BY a.skill")
    List<Object[]> getSkillStatsByFreelancer(@Param("freelancerId") Long freelancerId);

    List<ApplicationTracking> findByFreelancerAndSkillInAndWonFalse(
            Freelancer freelancer,
            List<String> skills
    );
}
