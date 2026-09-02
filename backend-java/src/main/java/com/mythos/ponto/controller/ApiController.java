package com.mythos.ponto.controller;

import com.mythos.ponto.entity.*; import com.mythos.ponto.repository.*; import org.springframework.http.*; import org.springframework.web.bind.annotation.*; import java.time.LocalDate; import java.util.*;

@RestController @RequestMapping("/api") @CrossOrigin(origins="*")
public class ApiController {
 private final UserRepository users; private final TimeLogRepository logs; private final JustificationRepository justifications; private final ReportRepository reports; private final NoticeRepository notices; private final ChatMessageRepository chat; private final AnnouncementRepository announcements;
 public ApiController(UserRepository u,TimeLogRepository l,JustificationRepository j,ReportRepository r,NoticeRepository n,ChatMessageRepository c,AnnouncementRepository a){users=u;logs=l;justifications=j;reports=r;notices=n;chat=c;announcements=a;}
 @PostMapping("/ponto/toggle") public ResponseEntity<?> toggle(@RequestParam Long userId){var u=users.findById(userId).orElse(null); if(u==null)return ResponseEntity.notFound().build(); var open=logs.findFirstByUserIdAndOpenTrue(userId); if(open.isPresent()){open.get().close(); return ResponseEntity.ok(logs.save(open.get()));} return ResponseEntity.ok(logs.save(new TimeLog(u)));}
 @GetMapping("/ponto/historico") public List<TimeLog> history(@RequestParam Long userId){return logs.findByUserIdOrderByClockInDesc(userId);}
 @PostMapping("/justificativas") public ResponseEntity<?> justification(@RequestParam Long userId,@RequestParam String date,@RequestParam String reason){var u=users.findById(userId).orElse(null); if(u==null)return ResponseEntity.notFound().build(); if(reason.isBlank())return ResponseEntity.badRequest().body("Motivo obrigatório"); return ResponseEntity.ok(justifications.save(new Justification(u,LocalDate.parse(date),reason)));}
 @GetMapping("/relatorios") public List<Report> reports(){return reports.findAllByOrderByIdDesc();}
 @GetMapping("/avisos") public List<Notice> notices(){return notices.findAllByOrderByIdDesc();}
 @GetMapping("/chat") public List<ChatMessage> chat(){return chat.findTop100ByOrderByCreatedAtDesc();}
 @PostMapping("/chat") public ResponseEntity<?> send(@RequestParam Long userId,@RequestParam String content){var u=users.findById(userId).orElse(null); if(u==null)return ResponseEntity.notFound().build(); if(content.isBlank())return ResponseEntity.badRequest().body("Mensagem obrigatória"); return ResponseEntity.ok(chat.save(new ChatMessage(u,content)));}
 @PostMapping("/novidades") public ResponseEntity<?> announcement(@RequestParam Long authorId,@RequestParam String title,@RequestParam String message){var u=users.findById(authorId).orElse(null); if(u==null)return ResponseEntity.notFound().build(); return ResponseEntity.ok(announcements.save(new Announcement(title,message,u)));}
 @GetMapping("/novidades") public List<Announcement> announcements(){return announcements.findAllByOrderByCreatedAtDesc();}
 @GetMapping("/usuarios") public List<User> users(){return users.findAll();}
}
