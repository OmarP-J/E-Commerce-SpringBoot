package com.codeshift.ecom.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Activa @Async para los correos de aviso de pedidos. Spring Boot aporta el
 * pool de hilos ("applicationTaskExecutor"), así que no hace falta definirlo.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}
