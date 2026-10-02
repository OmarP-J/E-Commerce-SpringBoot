package com.codeshift.ecom.repository;

/** Cuántas reseñas visibles de un producto tienen cierto número de estrellas. */
public record RatingCount(Integer rating, Long count) {
}
