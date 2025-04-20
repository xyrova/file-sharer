package com.lochan.filesharer.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.lochan.filesharer.exceptions.EmptyFileException;
import com.lochan.filesharer.exceptions.FileNotFoundException;
import com.lochan.filesharer.exceptions.UnsupportedFileException;
import com.lochan.filesharer.model.FileEntity;
import com.lochan.filesharer.repository.FileRepository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Random;

@Service
public class FileStorageService {

    // Directory where the files will be saved
    private static final String STORAGE_DIRECTORY = "/home/psyduck/Documents/Uploded";

    @Autowired
    private FileRepository fileRepository;

    // Save the file into the file system and store the file path in the database
    public String saveFile(MultipartFile fileToSave) throws IOException {
        if (fileToSave == null) {
            throw new EmptyFileException("File is null");
        }

        // Generate a unique file name to avoid overwriting files with the same name
        String fileName = System.currentTimeMillis() + "_" + fileToSave.getOriginalFilename();

        // Ensure the file path stays within the intended directory (security check)
        File targetFile = new File(STORAGE_DIRECTORY + File.separator + fileName);
        if (!Objects.equals(targetFile.getParent(), STORAGE_DIRECTORY)) {
            throw new UnsupportedFileException("Unsupported filename!");
        }

        // Copy the file to the storage directory
        Files.copy(fileToSave.getInputStream(), targetFile.toPath(), StandardCopyOption.REPLACE_EXISTING);

        // Generate a unique 4-digit PIN
        String pin = generatePin();

        LocalDateTime uploadTime = LocalDateTime.now();
        LocalDateTime expirationTime = uploadTime.plusHours(24); // File expires in 24 hours

        // Save the file metadata (file path) to the database
        FileEntity fileEntity = new FileEntity();
        fileEntity.setFileName(fileName); // Store the original file name
        fileEntity.setFilePath(targetFile.getAbsolutePath()); // Store the file path
        fileEntity.setPin(pin);
        fileEntity.setUploadTime(uploadTime);
        fileEntity.setExpirationTime(expirationTime);

        // Save file metadata in the database
        fileRepository.save(fileEntity);

        return pin; // Return the generated PIN for accessing the file
    }

    // Retrieve the file entity using the PIN
    public FileEntity getFileByPin(String pin) {
        return fileRepository.findByPin(pin);
    }

    // Mark the file as downloaded (to enforce one-time download)
    public void markFileAsDownloaded(FileEntity fileEntity) {
        fileEntity.setDownloaded(true);
        fileRepository.save(fileEntity);
    }

    // Check if the file has expired
    public boolean isExpired(FileEntity fileEntity) {
        return LocalDateTime.now().isAfter(fileEntity.getExpirationTime());
    }

    // Retrieve the file from the file system using the stored file path
    public File getDownloadFile(String filePath) throws IOException, FileNotFoundException {
        if (filePath == null) {
            throw new NullPointerException("filePath is null");
        }

        File fileToDownload = new File(filePath);

        // Ensure the file path is valid and within the allowed directory
        if (!fileToDownload.getCanonicalPath().startsWith(STORAGE_DIRECTORY)) {
            throw new UnsupportedFileException("Unsupported filename!");
        }

        if (!fileToDownload.exists()) {
            throw new FileNotFoundException("No file found at: " + filePath);
        }

        return fileToDownload; // Return the file for download
    }

    // Helper method to generate a random 4-digit PIN
    private String generatePin() {
        Random random = new Random();
        return String.format("%04d", random.nextInt(10000));
    }
}
