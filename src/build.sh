#!/bin/sh
cd "$(dirname "$0")"
cat all.js p6.js p7.js p8.js p9.js p10.js p11.js p12.js p13.js p14.js p15.js p16.js > /tmp/all2.js
node --check /tmp/all2.js || exit 1
cat head.html > ../index.html
printf '\n<script>\n' >> ../index.html
cat /tmp/all2.js >> ../index.html
printf '\n</script>\n' >> ../index.html
echo "index.html listo"
