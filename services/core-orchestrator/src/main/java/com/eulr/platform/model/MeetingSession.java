package com.eulr.platform.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "meeting_sessions", indexes = {
    @Index(name = "idx_meeting_status", columnList = "status"),
    @Index(name = "idx_meeting_scheduled", columnList = "scheduled_time")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(name = "meeting_url", nullable = false, length = 1024)
    private String meetingUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Platform platform;

    @Column(length = 128)
    private String passcode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private SessionStatus status;

    @Column(name = "scheduled_time", nullable = false)
    private LocalDateTime scheduledTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "persona_id", nullable = false)
    private String personaId;

    @Column(name = "persona_name", nullable = false)
    private String personaName;

    @Column(name = "s3_recording_uri")
    private String s3RecordingUri;

    @Column(name = "s3_audio_stem_uri")
    private String s3AudioStemUri;

    @Column(columnDefinition = "TEXT")
    private String executiveSummary;

    @ElementCollection
    @CollectionTable(name = "meeting_key_decisions", joinColumns = @JoinColumn(name = "meeting_id"))
    @Column(name = "decision", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> keyDecisions = new ArrayList<>();

    @OneToMany(mappedBy = "meetingSession", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ActionItemEntity> actionItems = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Platform {
        ZOOM, GOOGLE_MEET, MS_TEAMS, WEBEX, UNKNOWN
    }

    public enum SessionStatus {
        SCHEDULED, QUEUED, DISPATCHED, JOINING, IN_MEETING, RECORDING, PROCESSING_RAG, COMPLETED, FAILED
    }
}
