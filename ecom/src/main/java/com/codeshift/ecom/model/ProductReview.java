package com.codeshift.ecom.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

/**
 * Opinión de un cliente que recibió el producto. Solo puede haber una por
 * cliente y producto: si vuelve a opinar, se actualiza la que ya tenía.
 */
@Entity
@Table(name = "product_reviews", uniqueConstraints = @UniqueConstraint(columnNames = { "product_id", "author_id" }))
@Getter
@Setter
public class ProductReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Product product;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User author;
    /** De 1 a 5 estrellas. */
    @Column(nullable = false)
    private int rating;
    @Column(length = 1000)
    private String comment;
    /**
     * Moderación: una reseña oculta no se publica ni cuenta en la media. Solo
     * se oculta por incumplir las normas, nunca por ser negativa.
     */
    @Column(nullable = false)
    private boolean hidden = false;
    @Column(length = 300)
    private String hiddenReason;
    @Column(nullable = false)
    private Instant createdAt = Instant.now();
    @Column(nullable = false)
    private Instant updatedAt = Instant.now();
}
