package com.codeshift.ecom.service;

import com.codeshift.ecom.api.*;
import com.codeshift.ecom.model.*;
import com.codeshift.ecom.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional
public class CatalogService {
    private static final Pattern ACCENTS = Pattern.compile("\\p{M}+");
    private final ProductRepository products;
    private final CategoryRepository categories;
    private final CouponRepository coupons;
    private final InventoryMovementRepository movements;
    private final UserRepository users;

    @Transactional(readOnly = true)
    public Views.PageView<Views.ProductView> list(String search, Long categoryId, int page, int size, boolean admin) {
        if (page < 0 || size < 1 || size > 48 || search.length() > 120)
            throw ApiException.badRequest("Filtros inválidos.");
        var result = products.search(normalizeSearch(search), categoryId, admin,
                PageRequest.of(page, size, Sort.by("id").descending()));
        return new Views.PageView<>(result.map(admin ? Views.ProductView::ofAdmin : Views.ProductView::of).getContent(),
                result.getTotalElements(), page, result.getTotalPages());
    }

    public Product find(Long id) {
        return products.findById(id).orElseThrow(() -> ApiException.notFound("Producto no encontrado."));
    }

    public Views.ProductView detail(Long id) {
        Product p = find(id);
        if (!p.isActive())
            throw ApiException.notFound("Producto no disponible.");
        return Views.ProductView.of(p);
    }

    public Views.ProductView save(String actorEmail, Long id, Requests.ProductInput input) {
        Product p = id == null ? new Product()
                : products.lockById(id).orElseThrow(() -> ApiException.notFound("Producto no encontrado."));
        if (id != null && p.getVersion() != input.version())
            throw ApiException.conflict("El producto cambió. Recarga antes de editarlo.");
        int previousStock = id == null ? 0 : p.getStock();
        p.setName(input.name().trim());
        p.setDescription(input.description().trim());
        p.setPrice(input.price());
        if (input.cost() != null)
            p.setCost(input.cost());
        p.setStock(input.stock());
        p.setActive(input.active());
        p.setCategory(categories.findById(input.categoryId())
                .orElseThrow(() -> ApiException.badRequest("Selecciona una categoría válida.")));
        Product saved = products.saveAndFlush(p);
        if (saved.getStock() != previousStock) {
            User actor = users.findByEmail(actorEmail)
                    .orElseThrow(() -> ApiException.notFound("Usuario no encontrado."));
            InventoryMovement movement = new InventoryMovement();
            movement.setProduct(saved);
            movement.setPerformedBy(actor);
            movement.setType(id == null ? InventoryMovement.Type.ENTRY : InventoryMovement.Type.ADJUSTMENT);
            movement.setQuantityDelta(saved.getStock() - previousStock);
            movement.setPreviousStock(previousStock);
            movement.setNewStock(saved.getStock());
            movement.setNote(id == null ? "Existencias iniciales al crear el producto" : "Ajuste desde Administración");
            movements.save(movement);
        }
        return Views.ProductView.ofAdmin(saved);
    }

    public void archive(Long id) {
        Product product = products.lockById(id).orElseThrow(() -> ApiException.notFound("Producto no encontrado."));
        product.setActive(false);
    }

    public void image(Long id, MultipartFile file) throws IOException {
        if (file.isEmpty() || file.getSize() > 2 * 1024 * 1024)
            throw ApiException.badRequest("Selecciona una imagen de hasta 2 MB.");
        byte[] bytes = file.getBytes();
        boolean png = bytes.length >= 8 && bytes[0] == (byte) 137 && bytes[1] == 80 && bytes[2] == 78 && bytes[3] == 71
                && bytes[4] == 13 && bytes[5] == 10 && bytes[6] == 26 && bytes[7] == 10;
        boolean jpeg = bytes.length >= 3 && bytes[0] == (byte) 255 && bytes[1] == (byte) 216 && bytes[2] == (byte) 255;
        if (!png && !jpeg)
            throw ApiException.badRequest("Solo se permiten imágenes PNG o JPEG.");
        // Read dimensions without decoding the full image; reject decompression bombs.
        try (var stream = javax.imageio.ImageIO.createImageInputStream(new java.io.ByteArrayInputStream(bytes))) {
            var readers = javax.imageio.ImageIO.getImageReaders(stream);
            if (!readers.hasNext())
                throw ApiException.badRequest("Imagen inválida.");
            var reader = readers.next();
            try {
                reader.setInput(stream);
                if ((long) reader.getWidth(0) * reader.getHeight(0) > 16000000)
                    throw ApiException.badRequest("La imagen supera 16 megapíxeles.");
                if (reader.read(0) == null)
                    throw ApiException.badRequest("Imagen inválida.");
            } finally {
                reader.dispose();
            }
        } catch (IOException invalidImage) {
            throw ApiException.badRequest("No se pudo leer la imagen.");
        }
        Product product = products.lockById(id).orElseThrow(() -> ApiException.notFound("Producto no encontrado."));
        product.setImage(bytes);
        product.setImageType(png ? "image/png" : "image/jpeg");
    }

    public List<Views.CategoryView> categories() {
        return categories.findAll(Sort.by("name")).stream().map(Views.CategoryView::of).toList();
    }

    public Views.CategoryView category(Long id, Requests.CategoryInput input) {
        Category c = id == null ? new Category()
                : categories.findById(id).orElseThrow(() -> ApiException.notFound("Categoría no encontrada."));
        if (!input.name().trim().equalsIgnoreCase(c.getName())
                && categories.existsByNameIgnoreCase(input.name().trim()))
            throw ApiException.conflict("La categoría ya existe.");
        c.setName(input.name().trim());
        c.setDescription(input.description().trim());
        return Views.CategoryView.of(categories.saveAndFlush(c));
    }

    public void deleteCategory(Long id) {
        if (products.existsByCategoryId(id))
            throw ApiException.conflict("La categoría tiene productos. Reasígnalos antes de eliminarla.");
        categories.delete(categories.findById(id).orElseThrow(() -> ApiException.notFound("Categoría no encontrada.")));
    }

    public List<Views.CouponView> coupons() {
        return coupons.findAll(Sort.by("id").descending()).stream().map(Views.CouponView::of).toList();
    }

    public Views.CouponView coupon(Long id, Requests.CouponInput input) {
        if (input.active() && input.expiresOn().isBefore(LocalDate.now()))
            throw ApiException.badRequest("Un cupón activo no puede tener una fecha vencida.");
        Coupon c = id == null ? new Coupon()
                : coupons.findById(id).orElseThrow(() -> ApiException.notFound("Cupón no encontrado."));
        c.setCode(input.code().toUpperCase(Locale.ROOT));
        c.setDiscountPercent(input.discountPercent());
        c.setExpiresOn(input.expiresOn());
        c.setActive(input.active());
        return Views.CouponView.of(coupons.saveAndFlush(c));
    }

    private static String normalizeSearch(String value) {
        String decomposed = Normalizer.normalize(value.trim(), Normalizer.Form.NFD);
        return ACCENTS.matcher(decomposed).replaceAll("").toLowerCase(Locale.ROOT);
    }
}
