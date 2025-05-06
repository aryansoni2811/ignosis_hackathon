package com.example.backend.service;

import com.example.backend.dto.ProjectDTO;
import com.example.backend.entity.Client;
import com.example.backend.entity.Project;
import com.example.backend.repository.ClientRepository;
import com.example.backend.repository.ProjectRepository;
import com.example.backend.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    private static final Logger logger = LoggerFactory.getLogger(ProjectService.class);

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private RatingService ratingService;

    @Autowired
    private ClientRepository clientRepository;

    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProjectDTO> getProjectsByClient(String clientEmail) {
        Client client = clientRepository.findByEmail(clientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with email: " + clientEmail));

        return projectRepository.findByClientOrderByCreatedAtDesc(client).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProjectDTO> getProjectsByClientWithRatingInfo(String clientEmail, Long clientId) {
        Client client = clientRepository.findByEmail(clientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with email: " + clientEmail));

        List<Project> projects = projectRepository.findByClientOrderByCreatedAtDesc(client);

        return projects.stream()
                .map(project -> {
                    ProjectDTO dto = convertToDto(project);

                    // Check if the project has a freelancer assigned
                    if (project.getFreelancer() != null) {
                        Long freelancerId = project.getFreelancer().getId();

                        // Check if the client has already rated this project
                        boolean hasRated = false;
                        if (clientId != null && project.getId() != null) {
                            hasRated = ratingService.hasClientRatedFreelancerForProject(
                                    freelancerId, clientId, project.getId());
                        }

                        dto.setHasRated(hasRated);

                        // Get freelancer rating stats
                        Map<String, Object> ratingStats = ratingService.getFreelancerRatingStats(freelancerId);
                        dto.setFreelancerRating(ratingStats);
                    }

                    return dto;
                })
                .collect(Collectors.toList());
    }

    public ProjectDTO getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        return convertToDto(project);
    }

    public List<ProjectDTO> getProjectsByFreelancer(Long freelancerId) {
        List<Project> projects = projectRepository.findByFreelancerId(freelancerId);
        return projects.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public ProjectDTO completeProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!"In Progress".equals(project.getStatus())) {
            throw new IllegalStateException("Only projects in progress can be completed");
        }

        project.setStatus("Completed");
        project.setCompletedAt(LocalDateTime.now());
        Project savedProject = projectRepository.save(project);

        return convertToDto(savedProject);
    }

    @Transactional
    public ProjectDTO createProject(ProjectDTO projectDto) {
        try {
            logger.debug("Creating project with data: {}", projectDto);

            // Validate client exists
            if (projectDto.getClientEmail() == null || projectDto.getClientEmail().isEmpty()) {
                throw new IllegalArgumentException("Client email is required");
            }

            Client client = clientRepository.findByEmail(projectDto.getClientEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Client not found with email: " + projectDto.getClientEmail()));

            Project project = new Project();
            project.setTitle(projectDto.getTitle());
            project.setDescription(projectDto.getDescription());
            project.setBudget(projectDto.getBudget());
            project.setDeadline(projectDto.getDeadline());
            project.setCategory(projectDto.getCategory());
            project.setRequiredSkills(projectDto.getRequiredSkills());

            // Explicitly check if category is null or empty
            if (projectDto.getCategory() == null || projectDto.getCategory().isEmpty()) {
                throw new IllegalArgumentException("Project category is required");
            }
            project.setCategory(projectDto.getCategory());

            project.setStatus("Open"); // Default status for new projects
            project.setClient(client);
            project.setCreatedAt(LocalDateTime.now());

            Project savedProject = projectRepository.save(project);
            logger.debug("Project created with ID: {}", savedProject.getId());

            return convertToDto(savedProject);
        } catch (Exception e) {
            logger.error("Error creating project: ", e);
            throw e; // Re-throw to be handled by controller advice
        }
    }

    @Transactional
    public ProjectDTO updateProject(Long id, ProjectDTO projectDto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        project.setTitle(projectDto.getTitle());
        project.setDescription(projectDto.getDescription());
        project.setBudget(projectDto.getBudget());

        // Validate category before setting
        if (projectDto.getCategory() != null && !projectDto.getCategory().isEmpty()) {
            project.setCategory(projectDto.getCategory());
        }

        project.setDeadline(projectDto.getDeadline());
        project.setRequiredSkills(projectDto.getRequiredSkills());

        if (projectDto.getStatus() != null) {
            project.setStatus(projectDto.getStatus());
        }

        project.setUpdatedAt(LocalDateTime.now());
        Project updatedProject = projectRepository.save(project);
        return convertToDto(updatedProject);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        projectRepository.delete(project);
    }

    public Map<String, Long> getProjectCategoryStats() {
        return projectRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        Project::getCategory,
                        Collectors.counting()
                ));
    }

    public List<ProjectDTO> searchProjectsBySkills(String skills) {
        return projectRepository.findByRequiredSkillsContainingIgnoreCase(skills).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private ProjectDTO convertToDto(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setTitle(project.getTitle());
        dto.setDescription(project.getDescription());
        dto.setBudget(project.getBudget());
        dto.setDeadline(project.getDeadline());
        dto.setCategory(project.getCategory());
        dto.setRequiredSkills(project.getRequiredSkills());
        dto.setStatus(project.getStatus());
        dto.setClientEmail(project.getClient().getEmail());
        dto.setIsPaid(project.getPaid());

        // Add freelancer info if assigned
        if (project.getFreelancer() != null) {
            dto.setFreelancerId(project.getFreelancer().getId());
            dto.setFreelancerName(project.getFreelancer().getName());
            dto.setFreelancerEmail(project.getFreelancer().getEmail());
        }

        return dto;
    }
}