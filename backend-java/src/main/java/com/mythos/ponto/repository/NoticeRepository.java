package com.mythos.ponto.repository;
import com.mythos.ponto.entity.Notice; import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface NoticeRepository extends JpaRepository<Notice,Long> { List<Notice> findAllByOrderByIdDesc(); }
