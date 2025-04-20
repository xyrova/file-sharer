package com.lochan.filesharer.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lochan.filesharer.model.FileEntity;

public interface FileRepository extends JpaRepository<FileEntity, Long> {
    FileEntity findByPin(String pin);
}
