package com.mythos.ponto.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="time_logs")
public class TimeLog {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) private User user;
 @Column(nullable=false) private LocalDateTime clockIn;
 private LocalDateTime clockOut;
 private Long durationMinutes;
 @Column(nullable=false) private boolean open;
 protected TimeLog() {}
 public TimeLog(User user){this.user=user;this.clockIn=LocalDateTime.now();this.open=true;}
 public Long getId(){return id;} public User getUser(){return user;} public LocalDateTime getClockIn(){return clockIn;} public LocalDateTime getClockOut(){return clockOut;} public Long getDurationMinutes(){return durationMinutes;} public boolean isOpen(){return open;}
 public void close(){this.clockOut=LocalDateTime.now();this.durationMinutes=java.time.Duration.between(clockIn,clockOut).toMinutes();this.open=false;}
}
