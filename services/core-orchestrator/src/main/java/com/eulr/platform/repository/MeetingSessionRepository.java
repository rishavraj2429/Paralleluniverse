package com.eulr.platform.repository;

import com.eulr.platform.model.MeetingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface MeetingSessionRepository extends JpaRepository<MeetingSession, UUID> {

    List<MeetingSession> findByStatus(MeetingSession.SessionStatus status);

    @Query("SELECT m FROM MeetingSession m WHERE m.status = 'SCHEDULED' AND m.scheduledTime <= :threshold")
    List<MeetingSession> findPendingDispatches(LocalDateTime threshold);
}
