package com.codeshift.ecom.repository;

/** Media y número de reseñas visibles de un producto. */
public record RatingSummary(Long productId, Double average, Long count) {
}
