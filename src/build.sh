#!/bin/sh
# Construye public/index.html a partir de las capas de src/ y comprueba que no falte nada.
set -e
cd "$(dirname "$0")"
OUT="../public/index.html"
TMP="${TMPDIR:-/tmp}/ms-all2-$$.js"
LAYERS="all.js p6.js p7.js p8.js p9.js p10.js p11.js p12.js p13.js p14.js p15.js p16.js p17.js p18.js p20.js p21.js p22.js p23.js p24.js p25.js p26.js p27.js p28.js p29.js p19.js"

cat $LAYERS > "$TMP"
node --check "$TMP"
{
  cat shell.html
  cat head.html
  printf '\n<script>\n'
  cat "$TMP"
  printf '\n</script>\n</html>\n'
} > "$OUT.new"
rm -f "$TMP"

# red de seguridad: no publicar un index.html roto
BYTES=$(wc -c < "$OUT.new")
[ "$BYTES" -gt 300000 ] || { echo "ABORTADO: index.html solo $BYTES bytes"; rm -f "$OUT.new"; exit 1; }
head -c 20 "$OUT.new" | grep -qi '<!doctype html>' || { echo "ABORTADO: falta <!doctype html>"; rm -f "$OUT.new"; exit 1; }
for m in 'name="viewport"' 'charset="utf-8"' 'id="app"' 'function viewHome' 'function sbBoot' 'function heroBackdrop' 'function viewContract' 'function setLang'; do
  grep -q "$m" "$OUT.new" || { echo "ABORTADO: falta $m"; rm -f "$OUT.new"; exit 1; }
done
for f in vendor/jspdf.umd.min.js fonts/ms-sans-Regular.ttf fonts/ms-sans-Bold.ttf i18n/en.json i18n/pt.json i18n/pl.json i18n/uk.json; do
  [ -s "../public/$f" ] || { echo "ABORTADO: falta public/$f"; rm -f "$OUT.new"; exit 1; }
done
mv "$OUT.new" "$OUT"
echo "· build: public/index.html ($BYTES bytes)"
