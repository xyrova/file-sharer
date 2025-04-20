public class FileSizeExceededException extends Exception{
    public FileSizeExceededException(){
      super("File size is more than 100MB");
    }

  public FileSizeExceededException(String message){
    super(message);
  }
}
