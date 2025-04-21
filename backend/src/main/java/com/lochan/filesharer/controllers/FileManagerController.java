package com.lochan.filesharer.controllers;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus; // Add import for HttpStatus
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.lochan.filesharer.model.FileEntity;
import com.lochan.filesharer.services.FileStorageService;

@RestController
@CrossOrigin("http://127.0.0.1:3000/")
public class FileManagerController {

    @Autowired
    private FileStorageService fileStorageService;

    private static final Logger log = Logger.getLogger(FileManagerController.class.getName());

    private static final long MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

    // File upload: Save file to disk and generate a PIN
    @PostMapping("/upload-file")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // Check file size
            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body("File size exceeds the 100MB limit.");
            }

            // Save the file on disk and return the generated PIN
            String pin = fileStorageService.saveFile(file);
            return ResponseEntity.ok(pin); // Return the PIN to the client
        } catch (IOException e) {
            log.log(Level.SEVERE, "Exception during file upload", e);
            // Use HttpStatus for standard error codes
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("File upload failed");
        }
    }

    // File download: Retrieve the file using the PIN, check expiration and one-time
    // download
    @GetMapping("/download")
    public ResponseEntity<Resource> downloadFile(@RequestParam("pin") String pin) {
        try {
            // Get the file entity using the PIN
            FileEntity fileEntity = fileStorageService.getFileByPin(pin);

            // Check if the file exists
            if (fileEntity == null) {
                // Use HttpStatus for standard error codes
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null); // File not found
            }

            // Check if the file has expired
            if (fileStorageService.isExpired(fileEntity)) {
                // Use HttpStatus for standard error codes
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null); // File has expired
            }

            // Load the file from the file system using the file path
            java.io.File fileOnDisk = fileStorageService.getDownloadFile(fileEntity.getFilePath());
            if (!fileOnDisk.exists()) {
                // Use HttpStatus for standard error codes
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null); // File not found on disk
            }

            // Load the file into an InputStreamResource for download
            InputStreamResource resource = new InputStreamResource(new FileInputStream(fileOnDisk));

            // Return the file as a download response
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + fileEntity.getFileName() + "\"")
                    .contentLength(fileOnDisk.length())
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);

        } catch (Exception e) {
            log.log(Level.SEVERE, "Error during file download", e);
            // Use HttpStatus for standard error codes
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
