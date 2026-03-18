# NexusTools — Deploy Flow

---

## Arquitectura

```
[Dev PC] --rsync--> [Mini PC :3456] --Tailscale--> [VPS nginx :443] --> toolnexus.dev
                    systemd service                 Let's Encrypt SSL
                    Umami :3500                     analytics.toolnexus.dev
```

## Detalles

| Componente | Valor |
|-----------|-------|
| Mini PC IP (Tailscale) | 100.67.20.43 |
| VPS IP | 76.13.109.80 |
| Next.js port | 3456 |
| Umami port | 3500 |
| Deploy path | /home/ricardo/nexus-tools/ |
| Service | nexus-tools.service (systemd) |
| SSL | Let's Encrypt (expires 2026-06-09) |
| Domain | toolnexus.dev (.dev = HSTS forzado) |

## Pasos de deploy

```bash
# 1. Build local OK?
npm run build

# 2. rsync al Mini PC (excluye node_modules, .next, .git)
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  . ricardo@100.67.20.43:/home/ricardo/nexus-tools/

# 3. En Mini PC: install + build + restart
ssh ricardo@100.67.20.43 "cd /home/ricardo/nexus-tools && npm install && npm run build && sudo systemctl restart nexus-tools"

# 4. Verificar
curl -I https://toolnexus.dev
```

## Verificación post-deploy

1. `curl -I https://toolnexus.dev` — 200 OK
2. Security headers presentes (nosniff, DENY, HSTS)
3. Analytics: `curl -I https://analytics.toolnexus.dev` — 200 OK
4. Alguna herramienta al azar en browser — funciona

## Configs relevantes (VPS)

- `/etc/nginx/sites-available/toolnexus` — site config
- `/etc/nginx/sites-available/analytics-toolnexus` — Umami proxy
- `/etc/nginx/conf.d/security.conf` — security headers
