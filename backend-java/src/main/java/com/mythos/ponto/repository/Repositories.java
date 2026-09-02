package com.mythos.ponto.repository;
import com.mythos.ponto.entity.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public final class Repositories { private Repositories() {} }
interface UserRepository extends JpaRepository<User,Long> { Optional<User> findByEmail(String email); }
interface TimeLogRepository extends JpaRepository<TimeLog,Long> { Optional<TimeLog> findFirstByUserIdAndOpenTrue(Long userId); List<TimeLog> findByUserIdOrderByClockInDesc(Long userId); }
interface JustificationRepository extends JpaRepository<Justification,Long> { List<Justification> findByUserIdOrderByDateDesc(Long userId); }
interface ReportRepository extends JpaRepository<Report,Long> { List<Report> findAllByOrderByIdDesc(); }
interface NoticeRepository extends JpaRepository<Notice,Long> { List<Notice> findAllByOrderByIdDesc(); }
interface ChatMessageRepository extends JpaRepository<ChatMessage,Long> { List<ChatMessage> findTop100ByOrderByCreatedAtDesc(); }
interface AnnouncementRepository extends JpaRepository<Announcement,Long> { List<Announcement> findAllByOrderByCreatedAtDesc(); }
