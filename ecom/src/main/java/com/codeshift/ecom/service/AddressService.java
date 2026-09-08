package com.codeshift.ecom.service;

import com.codeshift.ecom.api.*;
import com.codeshift.ecom.model.*;
import com.codeshift.ecom.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AddressService {
    private final AddressRepository addresses;
    private final UserRepository users;

    @Transactional(readOnly = true)
    public List<Views.AddressView> list(String email) {
        User user = customer(email);
        return addresses.findByUserIdOrderByDefaultAddressDescIdAsc(user.getId()).stream().map(Views.AddressView::of)
                .toList();
    }

    public Views.AddressView save(String email, Long id, Requests.AddressInput input) {
        User user = customer(email);
        Address address = id == null ? new Address()
                : addresses.findByIdAndUserId(id, user.getId())
                        .orElseThrow(() -> ApiException.notFound("Dirección no encontrada."));
        if (id == null)
            address.setUser(user);
        boolean wasDefault = address.isDefaultAddress();
        boolean first = addresses.findByUserIdOrderByDefaultAddressDescIdAsc(user.getId()).isEmpty();
        if (input.defaultAddress() || first)
            clearDefaults(user.getId(), id);
        address.setLabel(input.label().trim());
        address.setRecipientName(input.recipientName().trim());
        address.setAddressLine(input.addressLine().trim());
        address.setCity(input.city().trim());
        address.setPhone(input.phone().trim());
        address.setDefaultAddress(input.defaultAddress() || first || wasDefault);
        return Views.AddressView.of(addresses.saveAndFlush(address));
    }

    public void delete(String email, Long id) {
        User user = customer(email);
        Address address = addresses.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> ApiException.notFound("Dirección no encontrada."));
        boolean wasDefault = address.isDefaultAddress();
        addresses.delete(address);
        addresses.flush();
        if (wasDefault)
            addresses.findByUserIdOrderByDefaultAddressDescIdAsc(user.getId()).stream().findFirst()
                    .ifPresent(next -> next.setDefaultAddress(true));
    }

    private void clearDefaults(Long userId, Long exceptId) {
        addresses.findByUserIdOrderByDefaultAddressDescIdAsc(userId).stream()
                .filter(address -> exceptId == null || !address.getId().equals(exceptId))
                .forEach(address -> address.setDefaultAddress(false));
    }

    private User customer(String email) {
        User user = users.findByEmail(email).orElseThrow(() -> ApiException.notFound("Usuario no encontrado."));
        if (user.getRole() != User.Role.CUSTOMER)
            throw ApiException.badRequest("La libreta de direcciones pertenece a cuentas cliente.");
        return user;
    }
}
