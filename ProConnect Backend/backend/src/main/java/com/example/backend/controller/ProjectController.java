package com.example.backend.controller;

import com.example.backend.dto.ProjectDTO;
import com.example.backend.entity.Project;
import com.example.backend.entity.SkillStatisticsEntity;
import com.example.backend.service.ProjectService;
import com.example.backend.service.SkillStatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private SkillStatisticsService skillStatisticsService;

    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/client")
    public ResponseEntity<List<ProjectDTO>> getProjectsByClient(@RequestParam String email) {
        return ResponseEntity.ok(projectService.getProjectsByClient(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PostMapping
    public ResponseEntity<ProjectDTO> createProject(@RequestBody @Validated ProjectDTO projectDto) {
        ProjectDTO createdProject = projectService.createProject(projectDto);

        // Update skill statistics after project creation
        if (projectDto.getRequiredSkills() != null && !projectDto.getRequiredSkills().isEmpty()) {
            String[] skills = projectDto.getRequiredSkills().split(",");
            for (String skill : skills) {
                skillStatisticsService.incrementSkillCount(skill.trim());
            }
        }

        return ResponseEntity.ok(createdProject);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTO> updateProject(@PathVariable Long id, @RequestBody @Validated ProjectDTO projectDto) {
        return ResponseEntity.ok(projectService.updateProject(id, projectDto));
    }

    @GetMapping("/freelancer/{freelancerId}")
    public ResponseEntity<List<ProjectDTO>> getProjectsByFreelancer(@PathVariable Long freelancerId) {
        return ResponseEntity.ok(projectService.getProjectsByFreelancer(freelancerId));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ProjectDTO> completeProject(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.completeProject(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/category-stats")
    public ResponseEntity<Map<String, Long>> getProjectCategoryStatistics() {
        return ResponseEntity.ok(projectService.getProjectCategoryStats());
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProjectDTO>> searchProjectsBySkills(@RequestParam String skills) {
        return ResponseEntity.ok(projectService.searchProjectsBySkills(skills));
    }

    @GetMapping("/client/with-ratings")
    public ResponseEntity<List<ProjectDTO>> getProjectsByClientWithRatings(
            @RequestParam String email,
            @RequestParam(required = false) Long clientId) {
        return ResponseEntity.ok(projectService.getProjectsByClientWithRatingInfo(email, clientId));
    }
}