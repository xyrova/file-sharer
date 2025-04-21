package com.lochan.filesharer.exceptions;

public class ExpireException extends Exception {
  public ExpireException(String message) {
    super(message);
  }
  public ExpireException() {
    super(" The File you are trying to download has expired ");
  }
  public ExpireException(String message, Throwable cause) {
    super(message, cause);
  } 
    
}
