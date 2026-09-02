package com.mythos.ponto.entity;
import jakarta.persistence.*; import java.time.LocalDate;
@Entity @Table(name="justifications") public class Justification {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) private User user; @Column(nullable=false) private LocalDate date;
 @Column(nullable=false,length=2000) private String reason; @Column(nullable=false) private String status="PENDING";
 protected Justification() {} public Justification(User u,LocalDate d,String r){user=u;date=d;reason=r;}
 public Long getId(){return id;} public User getUser(){return user;} public LocalDate getDate(){return date;} public String getReason(){return reason;} public String getStatus(){return status;}
}
