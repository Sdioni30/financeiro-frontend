# Financeiro - Frontend

Frontend React + Tailwind para a API Spring Boot.

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`. O backend precisa estar rodando em `http://localhost:8080`.

## ⚠️ Importante: configurar CORS no backend

Sua `SecurityConfig.java` não tem CORS liberado. Adicione:

```java
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

// dentro de securityFilterChain, antes do .csrf:
.cors(cors -> cors.configurationSource(corsSource()))

// novo bean:
@Bean
public CorsConfigurationSource corsSource() {
    CorsConfiguration cfg = new CorsConfiguration();
    cfg.setAllowedOrigins(List.of("http://localhost:5173"));
    cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
    cfg.setAllowedHeaders(List.of("*"));
    UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
    src.registerCorsConfiguration("/**", cfg);
    return src;
}
```

## Telas

- `/login` - login
- `/register` - cadastro
- `/` - dashboard (protegida): toggle Pessoal/Profissional, saldo, form de transação e histórico

## Endpoints consumidos

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/transacoes`
- `GET /api/transacoes`
- `GET /api/transacoes/saldo/{categoria}`
