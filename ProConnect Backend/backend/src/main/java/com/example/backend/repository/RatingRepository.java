package com.example.backend.repository;

import com.example.backend.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    List<Rating> findByFreelancerId(Long freelancerId);

    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.freelancerId = :freelancerId")
    Double findAverageRatingByFreelancerId(@Param("freelancerId") Long freelancerId);

    Optional<Rating> findByFreelancerIdAndClientIdAndProjectId(Long freelancerId, Long clientId, Long projectId);

    List<Rating> findAll();
    // Count total ratings for a freelancer
    @Query("SELECT COUNT(r) FROM Rating r WHERE r.freelancerId = :freelancerId")
    Long countByFreelancerId(@Param("freelancerId") Long freelancerId);
}