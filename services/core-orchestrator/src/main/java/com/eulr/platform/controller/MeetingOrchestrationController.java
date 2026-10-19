package com.eulr.platform.controller;

import com.eulr.platform.kafka.MeetingEventProducer;
import com.eulr.platform.model.MeetingSession;
import com.eulr.platform.repository.MeetingSessionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/meetings")
@Tag(name = "Meeting Orchestration API", description = "Enterprise meeting lifecycle, bot dispatch, and RAG trigger endpoints")
@SecurityRequirement(name = "BearerAuth")
public class MeetingOrchestrationController {

    private final MeetingSessionRepository repository;
    private final MeetingEventProducer kafkaProducer;
    private final StringRedisTemplate redisTemplate;

    public MeetingOrchestrationController(MeetingSessionRepository repository,
                                          MeetingEventProducer kafkaProducer,
                                          StringRedisTemplate redisTemplate) {
        this.repository = repository;
        this.kafkaProducer = kafkaProducer;
        this.redisTemplate = redisTemplate;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    @Operation(summary = "List all enterprise meeting sessions")
    public ResponseEntity<List<MeetingSession>> listMeetings() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping("/dispatch")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    @Operation(summary = "Schedule and dispatch an autonomous meeting bot worker")
    public ResponseEntity<?> scheduleAndDispatch(@Valid @RequestBody CreateMeetingRequest req) {
        // Enforce Redis distributed lock to prevent duplicate concurrent bot dispatch
        String lockKey = "lock:meeting-dispatch:" + req.getMeetingUrl().hashCode();
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofMinutes(2));

        if (Boolean.FALSE.equals(acquired)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A bot dispatch operation is already active for this meeting link.");
        }

        try {
            MeetingSession.Platform platform = detectPlatform(req.getMeetingUrl());

            MeetingSession session = MeetingSession.builder()
                    .title(req.getTitle())
                    .meetingUrl(req.getMeetingUrl())
                    .platform(platform)
                    .passcode(req.getPasscode())
                    .status(MeetingSession.SessionStatus.QUEUED)
                    .scheduledTime(req.getScheduledTime() != null ? req.getScheduledTime() : LocalDateTime.now())
                    .durationMinutes(req.getDurationMinutes() != null ? req.getDurationMinutes() : 30)
                    .personaId(req.getPersonaId() != null ? req.getPersonaId() : "default-exec-persona")
                    .personaName(req.getPersonaName() != null ? req.getPersonaName() : "Eulr Cloud Assistant")
                    .build();

            MeetingSession saved = repository.save(session);

            // Stream event to Kafka
            kafkaProducer.publishMeetingScheduledEvent(saved.getId(), saved.getMeetingUrl(), platform.name(), saved.getPersonaName());

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } finally {
            redisTemplate.delete(lockKey);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    @Operation(summary = "Get detailed meeting state, transcripts and AI summaries")
    public ResponseEntity<MeetingSession> getMeeting(@PathVariable UUID id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private MeetingSession.Platform detectPlatform(String url) {
        String lower = url.toLowerCase();
        if (lower.contains("zoom.us") || lower.contains("zoom.com")) return MeetingSession.Platform.ZOOM;
        if (lower.contains("meet.google.com")) return MeetingSession.Platform.GOOGLE_MEET;
        if (lower.contains("teams.microsoft.com")) return MeetingSession.Platform.MS_TEAMS;
        if (lower.contains("webex.com")) return MeetingSession.Platform.WEBEX;
        return MeetingSession.Platform.UNKNOWN;
    }

    @Data
    public static class CreateMeetingRequest {
        @NotBlank(message = "Meeting title is required")
        private String title;

        @NotBlank(message = "Meeting URL is required")
        private String meetingUrl;

        private String passcode;
        private LocalDateTime scheduledTime;
        private Integer durationMinutes;
        private String personaId;
        private String personaName;
    }
}
