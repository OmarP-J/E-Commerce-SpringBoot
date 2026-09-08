package com.codeshift.ecom.api;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.http.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ApiException.class)
    ResponseEntity<?> business(ApiException e) {
        return ResponseEntity.status(e.getStatus()).body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<?> validation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage()).findFirst()
                .orElse("Datos inválidos");
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }

    @ExceptionHandler({ DataIntegrityViolationException.class, ObjectOptimisticLockingFailureException.class })
    ResponseEntity<?> conflict(Exception e) {
        return ResponseEntity.status(409)
                .body(Map.of("message", "Los datos ya existen o fueron modificados. Actualiza e inténtalo otra vez."));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<?> upload(Exception e) {
        return ResponseEntity.status(413).body(Map.of("message", "La imagen no puede superar 2 MB."));
    }

    @ExceptionHandler({ org.springframework.http.converter.HttpMessageNotReadableException.class,
            org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class })
    ResponseEntity<?> malformed(Exception e) {
        return ResponseEntity.badRequest().body(Map.of("message", "La solicitud contiene datos inválidos."));
    }
}
