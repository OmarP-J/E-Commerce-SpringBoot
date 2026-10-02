package com.codeshift.ecom.api;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ReviewNameTest {

    @Test
    void reviewsShowOnlyTheFirstNameAndAnInitial() {
        assertThat(Views.ReviewView.publicName("Ana Pérez Gómez")).isEqualTo("Ana P.");
        assertThat(Views.ReviewView.publicName("  Luis   de la Cruz ")).isEqualTo("Luis C.");
        assertThat(Views.ReviewView.publicName("Cliente de prueba")).isEqualTo("Cliente P.");
        assertThat(Views.ReviewView.publicName("Ángel álvarez")).isEqualTo("Ángel Á.");
        assertThat(Views.ReviewView.publicName("Cliente")).isEqualTo("Cliente");
        assertThat(Views.ReviewView.publicName("María de")).isEqualTo("María");
    }
}
