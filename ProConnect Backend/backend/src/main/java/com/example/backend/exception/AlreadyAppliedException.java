package com.example.backend.exception;

public class AlreadyAppliedException extends RuntimeException {
    public AlreadyAppliedException() {
        super();
    }

    public AlreadyAppliedException(String message) {
        super(message);
    }

    public AlreadyAppliedException(String message, Throwable cause) {
        super(message, cause);
    }

    public AlreadyAppliedException(Throwable cause) {
        super(cause);
    }
}