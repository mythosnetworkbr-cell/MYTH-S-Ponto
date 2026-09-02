package com.mythos.ponto.repository;
import com.mythos.ponto.entity.TimeLog; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface TimeLogRepository extends JpaRepository<TimeLog,Long> { Optional<TimeLog> findFirstByUserIdAndOpenTrue(Long userId); List<TimeLog> findByUserIdOrderByClockInDesc(Long userId); }
