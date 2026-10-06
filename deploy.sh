#!/bin/sh
# Publica los cambios: GitHub -> Cloudflare Pages construye y despliega solo.
# Si existe ../.secrets/github-token, empuja con ese token (sin llavero),
# lo que permite publicar de forma automatica desde cualquier entorno.
set -e
cd "$(dirname "$0")"

MSG="${1:-actualizacion del sitio}"
TOKFILE="$(cd .. && pwd)/.secrets/github-token"
REPO="github.com/Amberace88/motorsubasta.git"

# Limpia cerrojos sobrantes de una ejecucion anterior (si se permite borrar)
rm -f .git/*.lock .git/objects/maintenance.lock 2>/dev/null || true
find .git/objects -name 'tmp_obj_*' -delete 2>/dev/null || true

git add -A
if git diff --cached --quiet; then
  echo "· sin cambios nuevos que commitear"
else
  git commit -q -m "$MSG"
  echo "· commit: $(git log --oneline -1)"
fi

if [ -s "$TOKFILE" ]; then
  TOK="$(tr -d ' \t\r\n' < "$TOKFILE")"
  git push -q "https://x-access-token:${TOK}@${REPO}" HEAD:main
  unset TOK
  echo "· push con token: OK"
else
  git push -q -u origin main
  echo "· push con llavero: OK"
fi

echo "Listo. Cloudflare Pages despliega en ~1 min: https://motorsubasta.pages.dev"
