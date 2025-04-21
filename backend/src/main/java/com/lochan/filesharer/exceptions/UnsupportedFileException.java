package com.lochan.filesharer.exceptions;

public class UnsupportedFileException extends SecurityException {
  public UnsupportedFileException(String message) {
    super(message);
  }
  public UnsupportedFileException() {
    super("Unexpected File type intrduced.");
  }
}
