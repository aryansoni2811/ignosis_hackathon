package com.example.backend.repository;

import com.example.backend.entity.Project;
import com.example.backend.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

// ProjectRepository.java
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByClient(Client client);
    List<Project> findByClientOrderByCreatedAtDesc(Client client);
    List<Project> findByRequiredSkillsContainingIgnoreCase(String skill);

    List<Project> findByFreelancerId(Long freelancerId);

    @Query("SELECT p FROM Project p WHERE p.freelancer.id = :freelancerId AND p.status = 'Completed'")
    List<Project> findCompletedProjectsByFreelancerId(@Param("freelancerId") Long freelancerId);

    @Query("SELECT p FROM Project p WHERE p.freelancer.id = :freelancerId AND p.status = 'In Progress'")
    List<Project> findActiveProjectsByFreelancerId(@Param("freelancerId") Long freelancerId);
}