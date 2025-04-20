package com.lochan.filesharer.exceptions;

public class FileNotFoundException extends Exception {
  public FileNotFoundException() {
    super("The File you are trying to download doesn't exists");
  }

  public FileNotFoundException(String message) {
    super(message);
  }
}
