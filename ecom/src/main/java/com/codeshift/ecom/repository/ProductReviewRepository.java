package com.codeshift.ecom.repository;

import com.codeshift.ecom.model.ProductReview;
import org.springframework.data.jpa.repository.*;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    Optional<ProductReview> findByProductIdAndAuthorId(Long productId, Long authorId);

    @EntityGraph(attributePaths = "author")
    List<ProductReview> findTop100ByProductIdAndHiddenFalseOrderByCreatedAtDesc(Long productId);

    @EntityGraph(attributePaths = { "author", "product" })
    List<ProductReview> findAllByOrderByCreatedAtDesc();

    /** Una sola consulta para toda la página del catálogo, en vez de una por producto. */
    @Query("""
            select new com.codeshift.ecom.repository.RatingSummary(r.product.id, avg(r.rating), count(r))
            from ProductReview r
            where r.hidden = false and r.product.id in :productIds
            group by r.product.id
            """)
    List<RatingSummary> summaries(Collection<Long> productIds);

    @Query("""
            select new com.codeshift.ecom.repository.RatingCount(r.rating, count(r))
            from ProductReview r
            where r.hidden = false and r.product.id = :productId
            group by r.rating
            """)
    List<RatingCount> distribution(Long productId);
}
