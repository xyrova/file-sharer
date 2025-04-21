package com.lochan.filesharer.exceptions;

public class EmptyFileException extends NullPointerException {
  public EmptyFileException(String message) {
    super(message);
  }
  public EmptyFileException() {
    super(" The File is Empty!! ");
  }
}
