#!/bin/sh
# Publica los cambios: GitHub -> Cloudflare Pages construye y despliega solo.
cd "$(dirname "$0")"
git add -A
git commit -m "${1:-actualizacion del sitio}" || echo "nada que commitear"
git push -u origin main
echo "Listo. Cloudflare Pages despliega en ~1 minuto: https://motorsubasta.pages.dev"
