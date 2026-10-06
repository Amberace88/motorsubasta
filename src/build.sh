#!/bin/sh
# Construye public/index.html a partir de las capas de src/.
set -e
cd "$(dirname "$0")"
OUT="../public/index.html"
TMP="$(mktemp -t ms-all2.XXXXXX.js)"

cat all.js p6.js p7.js p8.js p9.js p10.js p11.js p12.js p13.js p14.js p15.js p16.js > "$TMP"
node --check "$TMP"

{
  cat head.html
  printf '\n<script>\n'
  cat "$TMP"
  printf '\n</script>\n'
} > "$OUT.new"
rm -f "$TMP"

# red de seguridad: no publicar un index.html roto
BYTES=$(wc -c < "$OUT.new")
[ "$BYTES" -gt 300000 ] || { echo "ABORTADO: index.html solo $BYTES bytes"; rm -f "$OUT.new"; exit 1; }
for m in 'id="app"' 'function viewHome' 'function sbBoot' 'function heroBackdrop'; do
  grep -q "$m" "$OUT.new" || { echo "ABORTADO: falta $m"; rm -f "$OUT.new"; exit 1; }
done

mv "$OUT.new" "$OUT"
echo "· build: public/index.html ($BYTES bytes)"
