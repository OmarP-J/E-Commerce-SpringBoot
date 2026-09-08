package com.codeshift.ecom.repository;

import com.codeshift.ecom.model.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import java.util.Optional;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
  @Query("""
      select p from Product p
      where (:admin = true or p.active = true)
        and (
          cast(function('translate', lower(p.name), 'áàäâãåéèëêíìïîóòöôõúùüûñç', 'aaaaaaeeeeiiiiooooouuuunc') as string) like concat('%', :search, '%')
          or cast(function('translate', lower(p.description), 'áàäâãåéèëêíìïîóòöôõúùüûñç', 'aaaaaaeeeeiiiiooooouuuunc') as string) like concat('%', :search, '%')
          or cast(function('translate', lower(p.category.name), 'áàäâãåéèëêíìïîóòöôõúùüûñç', 'aaaaaaeeeeiiiiooooouuuunc') as string) like concat('%', :search, '%')
        )
        and (:categoryId is null or p.category.id = :categoryId)
      """)
  Page<Product> search(String search, Long categoryId, boolean admin, Pageable pageable);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select p from Product p where p.id = :id")
  Optional<Product> lockById(Long id);

  boolean existsByCategoryId(Long categoryId);

  List<Product> findByActiveTrueAndStockLessThanEqualOrderByStockAscNameAsc(int threshold);
}
