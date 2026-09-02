package com.mythos.ponto.entity;
import jakarta.persistence.*;
@Entity @Table(name="notices") public class Notice {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false) private String title; @Column(nullable=false,length=4000) private String message; private String type; private String severity; @Column(nullable=false) private boolean resolved=false;
 protected Notice() {} public Notice(String t,String m,String type,String severity){title=t;message=m;this.type=type;this.severity=severity;}
 public Long getId(){return id;} public String getTitle(){return title;} public String getMessage(){return message;} public String getType(){return type;} public String getSeverity(){return severity;} public boolean isResolved(){return resolved;}
}
