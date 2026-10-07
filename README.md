# MotorSubasta — v9 (ar Supabase)

## Divi režīmi vienā failā

`index.html` pats nosaka, kur tas darbojas:

- **Ir tīkls un Supabase** → ielādē datus no datubāzes, īsta pieteikšanās, īstas pujas ar realtime. Apakšā kreisajā stūrī uz brīdi parādās zaļa zīme `DATOS EN VIVO · SUPABASE`.
- **Nav tīkla** (piem. atvērts no diska vai Claude artifact lapā) → automātiski pārslēdzas uz demo datiem pārlūkā. Nekas nesalūzt.

## Supabase projekts (jau izveidots un aizpildīts)

- Organizācija: **Motorsubasta** · plāns **Free** · izmaksas **0 €**
- Projekts: **motorsubasta** · reģions West EU (Ireland) · ref `fcyirclkkhlfrnmrvbja`
- Konts, kuram tas pieder: vincheckspain@gmail.com

Kas tajā ir:

| | |
|---|---|
| Tabulas | 16 |
| RLS politikas | 27 |
| Funkcijas | `place_bid`, `close_due_auctions`, `buyer_fee`, `bid_increment`, `is_admin`, `is_verified`, `handle_new_user`, `vehicle_condition_score` |
| Realtime | `bids`, `auctions` |
| Buckets | `vehicle-photos` (publisks), `documents` (privāts) |
| Dati | 16 auto subastās (4 dzīvas), 6 sludinājumi mercado, 4 konti |

### Testa konti

| Loma | E-pasts | Parole |
|---|---|---|
| Pircējs | comprador@demo.es | demo1234 |
| Pārdevējs | vendedor@demo.es | demo1234 |
| Dealer | dealer@demo.es | demo1234 |
| Admin | admin@motorsubasta.com | demo1234 |

Visiem jau ir `verificado` statuss, tāpēc var uzreiz pujāt.

### Pārbaudīta loģika (uz lokālās Postgres kopijas)

- Puja → minimālais solis pēc cenu tramja (1500 € → 50 €)
- Autopuja atbild automātiski (1400 → 1450) un ir atzīmēta kā `is_auto`
- Anti-sniping: puja pēdējā minūtē pagarina izsoli par 2 minūtēm
- `close_due_auctions()` → statuss `adjudicada`, uzvarētājs, `orders` ieraksts, auto statuss `vendido`, paziņojumi pircējam, pārdevējam un pārspētajiem
- Komisijas no īstās tabulas: 1500 € → 139 €, 9000 € → 359 €

## Mapes saturs

```
index.html                       gatavā lapa (abi režīmi)
img/                             auto foto + logo
motorsubasta-site.zip            gatavs augšupielādei (Netlify Drop)
src/                             avota slāņi + build.sh
supabase/00-reset.sql            tīra public shēmu (pirms atkārtotas uzlikšanas)
supabase/01-schema.sql           tabulas, RLS, funkcijas, realtime
supabase/02-buckets-y-cuentas.sql buckets + 4 demo konti
supabase/03-inventario-demo.sql  demo inventārs
```

Visi četri SQL faili jau ir uzlikti projektā. Tie ir atkārtoti palaižami tādā pašā secībā.

### src/ slāņi

| Fails | Saturs |
|---|---|
| all.js | ikonas, dati, stāvoklis, maršrutētājs, admin panelis |
| p6.js | tipogrāfija, animācijas, sākumlapa |
| p7.js | UX un pieejamība |
| p8.js | inventārs, sesijas, ātrā solīšana |
| p9.js | auto lapa, mercado, valoración, empresa |
| p10.js | ikonu komplekts |
| p11.js | autentifikācija, lomas, publiskās lapas |
| p12.js | pircēja un pārdevēja konts, maršrutēšana ar tiesībām |
| p13.js | lota apmaksa, profila pabeigšana, admin analītika |
| p14.js | **Supabase: auth, inventārs, pujas realtime, favorīti, publicēšana** |

Pēc izmaiņām: `sh src/build.sh`

## Palaišana tiešsaistē

Vienkāršākais: atver https://app.netlify.com/drop un uzmet tur `motorsubasta-site.zip`. Netlify atgriež URL dažās sekundēs. Zip jau satur `_redirects` SPA maršrutēšanai.

## Kas vēl līdz īstai palaišanai

1. **Google pieteikšanās** — Supabase → Authentication → Providers → Google.
2. **Maksājumi** — Stripe atslēgas; kases 4. solis jau ir sagatavots pasei.
3. **Veriff** — identitātes verifikācijai (`profiles.verification` jau ir shēmā).
4. **Cron** — `select close_due_auctions();` ik minūti (Supabase → Integrations → Cron).
5. **Foto augšupielāde** — publicēšanas vednis pagaidām saglabā auto bez bildēm; bucket `vehicle-photos` ir gatavs.
6. **Domēns** — pievienot motorsubasta.com Netlify pusē.

## v12 · 2026-10-07

- **Contrato de compraventa** (`#/contrato`, gratis): formulario guiado, validación DNI/NIE/CIF/VIN/matrícula,
  importe en letras, firma en pantalla, PDF con fuente Unicode (`public/fonts`, `public/vendor/jspdf.umd.min.js`),
  copia traducida opcional. Prellenado desde un lote ganado: `#/contrato?lote=<id>`. Nada se envía al servidor.
- **Idiomas**: es (base), en, pt, pl, uk. Diccionarios en `public/i18n/*.json`; capa de traducción en `src/p19.js`.
  Enlace directo: `?lang=en`. Lo marcado con `translate="no"` no se traduce.
- **Sesiones** cerradas por defecto en portada y en Subastas, con vehículos, precio desde, pujas y cuenta atrás.
- **Punto naranja** en Subastas: late con subastas en directo, fijo con puja anticipada abierta.
- **Documento HTML correcto** (`src/shell.html`): doctype, charset, viewport (móviles), favicon y Open Graph.

### Pendiente de decidir (Eddie)
`supabase/05-demo-viva.sql` mantiene la demo viva: reprograma cada día las subastas de `vendedor@demo.es`
en su sesión (hora de Madrid) y cierra las reales con `close_due_auctions()` cada 5 min mediante pg_cron.
**No está aplicado.** Para activarlo: Supabase → SQL Editor → pegar el archivo → Run.
Para quitarlo antes del lanzamiento: `select cron.unschedule('motorsubasta-tick');`
