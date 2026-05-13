package com.codeshift.ecom.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "com.codeshift.ecom.Repository")
public class JpaConfig {

}
