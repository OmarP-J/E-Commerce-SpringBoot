package com.codeshift.ecom.service;

import com.codeshift.ecom.api.*;
import com.codeshift.ecom.model.Product;
import com.codeshift.ecom.model.ProductReview;
import com.codeshift.ecom.model.User;
import com.codeshift.ecom.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Reseñas de compradores verificados. Solo opina quien tiene un pedido
 * entregado con ese producto: así ninguna valoración es inventada, y el
 * equipo de la tienda no puede escribir reseñas a mano.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {
    private final ProductReviewRepository reviews;
    private final ProductRepository products;
    private final OrderRepository orders;
    private final UserRepository users;

    @Transactional(readOnly = true)
    public Views.ReviewSummary summary(Long productId) {
        Product product = products.findById(productId)
                .orElseThrow(() -> ApiException.notFound("Producto no encontrado."));
        if (!product.isActive())
            throw ApiException.notFound("Producto no disponible.");
        Long[] counts = { 0L, 0L, 0L, 0L, 0L };
        long total = 0;
        long stars = 0;
        for (RatingCount row : reviews.distribution(productId)) {
            counts[row.rating() - 1] = row.count();
            total += row.count();
            stars += row.rating() * row.count();
        }
        Double average = total == 0 ? null : (double) stars / total;
        return new Views.ReviewSummary(average, total, List.of(counts),
                reviews.findTop100ByProductIdAndHiddenFalseOrderByCreatedAtDesc(productId).stream()
                        .map(Views.ReviewView::of).toList());
    }

    /** Añade la valoración media a cada producto de una página del catálogo. */
    @Transactional(readOnly = true)
    public List<Views.ProductView> withRatings(List<Views.ProductView> page) {
        if (page.isEmpty())
            return page;
        Map<Long, RatingSummary> byProduct = reviews.summaries(page.stream().map(Views.ProductView::id).toList())
                .stream().collect(Collectors.toMap(RatingSummary::productId, Function.identity()));
        return page.stream().map(view -> {
            RatingSummary rating = byProduct.get(view.id());
            return rating == null ? view : view.withRating(rating.average(), rating.count());
        }).toList();
    }

    @Transactional(readOnly = true)
    public Views.MyReview mine(String email, Long productId) {
        User user = customer(email);
        return Views.MyReview.of(orders.hasDeliveredPurchase(user.getId(), productId),
                reviews.findByProductIdAndAuthorId(productId, user.getId()).orElse(null));
    }

    public Views.MyReview save(String email, Long productId, Requests.ReviewInput input) {
        User user = customer(email);
        Product product = products.findById(productId)
                .orElseThrow(() -> ApiException.notFound("Producto no encontrado."));
        if (!orders.hasDeliveredPurchase(user.getId(), productId))
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Solo puedes opinar sobre productos de un pedido que ya recibiste.");
        ProductReview review = reviews.findByProductIdAndAuthorId(productId, user.getId()).orElseGet(() -> {
            ProductReview created = new ProductReview();
            created.setProduct(product);
            created.setAuthor(user);
            return created;
        });
        review.setRating(input.rating());
        String comment = input.comment() == null ? "" : input.comment().trim();
        review.setComment(comment.isEmpty() ? null : comment);
        review.setUpdatedAt(Instant.now());
        // Editarla no la vuelve visible si estaba oculta: eso lo decide quien
        // modera, después de comprobar que ya cumple las normas.
        reviews.saveAndFlush(review);
        return Views.MyReview.of(true, review);
    }

    public void delete(String email, Long productId) {
        User user = customer(email);
        reviews.findByProductIdAndAuthorId(productId, user.getId()).ifPresent(reviews::delete);
    }

    @Transactional(readOnly = true)
    public List<Views.AdminReviewView> all() {
        return reviews.findAllByOrderByCreatedAtDesc().stream().map(Views.AdminReviewView::of).toList();
    }

    public Views.AdminReviewView visibility(Long id, Requests.ReviewVisibility input) {
        ProductReview review = reviews.findById(id).orElseThrow(() -> ApiException.notFound("Reseña no encontrada."));
        review.setHidden(input.hidden());
        review.setHiddenReason(input.hidden() ? input.reason().trim() : null);
        return Views.AdminReviewView.of(review);
    }

    private User customer(String email) {
        return users.findByEmail(email).orElseThrow(() -> ApiException.notFound("Usuario no encontrado."));
    }
}
