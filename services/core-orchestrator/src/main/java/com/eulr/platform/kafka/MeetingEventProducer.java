package com.eulr.platform.kafka;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class MeetingEventProducer {

    private static final Logger log = LoggerFactory.getLogger(MeetingEventProducer.class);
    private static final String TOPIC_MEETING_EVENTS = "meeting-orchestration-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public MeetingEventProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishMeetingScheduledEvent(UUID meetingId, String meetingUrl, String platform, String personaName) {
        MeetingEvent event = MeetingEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .meetingId(meetingId)
                .eventType("MEETING_DISPATCH_TRIGGERED")
                .meetingUrl(meetingUrl)
                .platform(platform)
                .personaName(personaName)
                .timestamp(LocalDateTime.now())
                .build();

        log.info("Emitting Kafka event [{}] for meeting: {}", event.getEventType(), meetingId);
        kafkaTemplate.send(TOPIC_MEETING_EVENTS, meetingId.toString(), event);
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MeetingEvent {
        private String eventId;
        private UUID meetingId;
        private String eventType;
        private String meetingUrl;
        private String platform;
        private String personaName;
        private LocalDateTime timestamp;
    }
}
