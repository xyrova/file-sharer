package com.lochan.filesharer.exceptions;

public class EmptyFileException extends NullPointerException {
  public EmptyFileException() {
    super("The File is Empty!!");
  }

  public EmptyFileException(String message) {
    super(message);
  }
}
