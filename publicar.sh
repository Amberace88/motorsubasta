#!/bin/sh
# Un solo comando: construye, verifica y publica.
#   ./publicar.sh "mensaje del commit"
set -e
cd "$(dirname "$0")"
./src/build.sh
./deploy.sh "${1:-actualizacion del sitio}"
