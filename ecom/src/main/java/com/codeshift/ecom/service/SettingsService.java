package com.codeshift.ecom.service;

import com.codeshift.ecom.api.*;
import com.codeshift.ecom.model.StoreSettings;
import com.codeshift.ecom.repository.StoreSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class SettingsService {
    private final StoreSettingsRepository settings;

    public StoreSettings currentEntity() {
        return settings.findById(1L).orElseGet(() -> settings.save(new StoreSettings()));
    }

    @Transactional(readOnly = true)
    public Views.SettingsView current() {
        return settings.findById(1L).map(Views.SettingsView::of)
                .orElseGet(() -> Views.SettingsView.of(new StoreSettings()));
    }

    public Views.SettingsView save(Requests.SettingsInput input) {
        StoreSettings value = currentEntity();
        value.setStoreName(input.storeName().trim());
        value.setLowStockThreshold(input.lowStockThreshold());
        value.setSupportEmail(input.supportEmail().trim().toLowerCase(Locale.ROOT));
        return Views.SettingsView.of(settings.save(value));
    }
}
