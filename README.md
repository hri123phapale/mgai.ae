# mgai.ae website

Static site: plain HTML, CSS and JavaScript. No build step. Upload the whole folder to any web host.

```
index.html        page markup (every text string has a data-i18n key)
css/styles.css    design, light/dark themes, RTL-safe layout
js/i18n.js        English and Arabic text
js/config.js      contact form settings (where submissions go)
js/main.js        language/theme toggles, menu, animations, form logic
robots.txt        search engine rules
sitemap.xml       page list for search engines (en + ar)
site.webmanifest  app icon info
assets/           logo.svg (original), logo-full*.svg (cropped, light/dark versions), favicon.svg
```

## Preview locally
Open `index.html` in a browser, or run `npx serve .` (or `python -m http.server`) in this folder.

## Contact form
Out of the box it uses FormSubmit and emails every enquiry to info@mgai.ae.
The very first submission triggers a one-time activation email to info@mgai.ae: click the link in it once.
To use Web3Forms or Formspree instead, edit `js/config.js` (instructions inside).

## Editing text
Change wording in `js/i18n.js` for both languages. The English text in `index.html` is only the fallback before JS loads.

## Theme and language
Both follow the visitor's choice and are remembered in the browser. First visit uses the OS light/dark preference and English.

## SEO
- Title, description, canonical, Open Graph/Twitter tags and Organization structured data are in the `<head>` of `index.html`.
- Arabic version is reachable at `https://mgai.ae/?lang=ar` (hreflang en/ar set; title, description and canonical switch with the language).
- `robots.txt`, `sitemap.xml` and `site.webmanifest` sit in the site root. Share image: `assets/og-image.png` (1200x630).
- After going live, submit `https://mgai.ae/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
