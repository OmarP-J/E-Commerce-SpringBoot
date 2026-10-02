package com.codeshift.ecom.service;

import com.codeshift.ecom.config.PaymentProperties;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PaymentServiceTest {

    @Test
    void liveModeDisablesGatewaysWhenTheyWouldChargeAnotherCurrency() {
        PaymentProperties config = liveGateways("USD");

        new PaymentService(config).enforceTestMode();

        assertThat(config.getPaypal().isConfigured()).isFalse();
        assertThat(config.getStripe().isConfigured()).isFalse();
    }

    @Test
    void liveModeKeepsGatewaysWhenTheyChargeInPesos() {
        PaymentProperties config = liveGateways("DOP");

        new PaymentService(config).enforceTestMode();

        assertThat(config.getPaypal().isConfigured()).isTrue();
        assertThat(config.getStripe().isConfigured()).isTrue();
    }

    private static PaymentProperties liveGateways(String currency) {
        PaymentProperties config = new PaymentProperties();
        config.setMode(PaymentProperties.Mode.LIVE);
        config.setCurrency(currency);
        config.getPaypal().setEnabled(true);
        config.getPaypal().setClientId("client-id");
        config.getPaypal().setClientSecret("client-secret");
        config.getPaypal().setApiBase("https://api-m.paypal.com");
        config.getStripe().setEnabled(true);
        config.getStripe().setPublishableKey("pk_live_example");
        config.getStripe().setSecretKey("sk_live_example");
        return config;
    }
}
