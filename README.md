# bigdreambd.com — Big Dream Corporation

A static one-page website built with plain HTML, CSS and JavaScript. It needs no build step: upload the whole folder to any web host (cPanel `public_html`, Netlify, Vercel, GitHub Pages and so on).

```
index.html        page content
css/style.css     all styles
js/main.js        menu, world map, logo fallbacks, client marquee, quote form
.htaccess         hides README.md, forces https (Apache hosts only)
assets/logo/      company logo
assets/brands/    mill / brand logos
assets/clients/   client logos
assets/img/       spare folder for photos
```

To preview it locally, run this inside the folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000

## Logo files to add

Until a logo file exists, the site shows the name as styled text, so nothing looks broken. Add each file with **exactly** the filename below. PNG with a transparent background works best (SVG also works if you change the extension in `index.html`).

**Company logo:** `assets/logo/logo.svg` is in place (vector). The link-preview image for WhatsApp and Facebook is `assets/img/og-image.png` (1200×630), rendered from the same logo. Re-create it if the logo changes.

**Brands:** `assets/brands/`

| File | Brand |
|---|---|
| cordenons.png | Cordenons |
| favini.png | Favini |
| sappi.png | Sappi |
| tyvek.png | DuPont Tyvek |
| lenk.png | Lenk Paper |
| hansol.png | Hansol |
| fedrigoni.png | Fedrigoni |
| chenming.png | Chenming |
| bohui.png | Bohui Paper |
| app.png | APP (Asia Pulp & Paper) |
| itc.png | ITC |

**Clients:** `assets/clients/`

| File | Client |
|---|---|
| bangladesh-army.png | Bangladesh Army |
| bangladesh-police.png | Bangladesh Police |
| govt-bangladesh.png | Govt. of Bangladesh |
| undp.png | UNDP |
| save-the-children.png | Save the Children |
| unilever.png | Unilever |
| hsbc.png | HSBC |
| lankabangla.png | LankaBangla |
| bkash.png | bKash |
| beximco.png | Beximco |
| american-express.png | American Express |
| berger.png | Berger |
| city-bank.png | City Bank |
| islami-bank.png | Islami Bank |
| pubali-bank.png | Pubali Bank |
| asiatic.png | Asiatic |
| spectrum.png | Spectrum |
| partex-group.png | Partex Group |
| dhaka-club.png | Dhaka Club |
| sanmar.png | Sanmar |
| grey.png | Grey |
| navana-group.png | Navana Group |
| dekko.png | Dekko |
| expeditors.png | Expeditors |
| lafarge-surma.png | Lafarge Surma Cement |
| bitopi.png | Bitopi Advertising |

## Things to confirm before going live

1. **Email address.** The site shows `info@bigdreambd.com` as the public contact address. If you use a different one, find-and-replace every occurrence in `index.html` (including the JSON-LD block in the `<head>`), and in `EMAIL` at the top of `js/main.js` (that's where the Gmail button sends to).
2. **Stats strip** (11+ mill brands, 15 categories, 26+ clients, 2 ways to buy). These numbers are counted from the brochure. Edit them in the `stats` section of `index.html` if you'd rather show other figures (years in business, tonnes per year, etc.).
3. **FSC certification.** The site does not claim it. If Big Dream is certified, add it to the "Why buyers choose Big Dream" section along with the certificate code.
4. **Source countries** on the hero map and in the About text are inferred from where the listed mills are based (Italy, Germany, South Africa, Korea, China, Indonesia, India). Edit `SOURCES` in `js/main.js` and the About paragraph if they differ.

## Common edits

- **Phone / WhatsApp number:** search `8801686223735` in `index.html` and `WHATSAPP_NUMBER` in `js/main.js`.
- **Add a product:** copy one `<li class="swatch">` block in the Products section. `--tab` sets the colour of the edge. Add the same name to the form's `<select>`.
- **Add a client or brand:** copy one `<li>` in the relevant list and add the logo file.
- **Colours and fonts:** defined at the top of `css/style.css` (`--magenta`, `--slate`, etc.).

## How the quote form works

There is no server code. **Send via Gmail** opens Gmail's compose window in a new tab, addressed to `EMAIL` (top of `js/main.js`), with the subject and the visitor's enquiry filled in. The visitor presses Send in Gmail. Visitors who aren't signed in to Gmail are asked to sign in first.

**Send on WhatsApp instead** opens WhatsApp with the same message to +880 1686-223735.
