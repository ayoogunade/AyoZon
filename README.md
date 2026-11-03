# AyoZon

A small shop for landscape photographs sold as full-resolution downloads. Built with React (Vite + Tailwind) and a
Flask API, with Stripe payments, emailed delivery through Resend, and an admin dashboard for managing the catalogue.

Payments run in Stripe test mode: nothing is ever charged.

## What it does

- **Shop**: a crossfading hero of the catalogue, a gallery you can sort, a page per photograph with its real size,
  and a cart that remembers its contents.
- **Checkout**: Stripe's Payment Element, styled to match the site, with copyable test cards. The server sets the
  price, never the browser.
- **Delivery**: after payment, the order page has a download button for each photograph (protected by a per-order
  token), and an email arrives with the files attached.
- **Admin**: revenue, orders and the best seller at a glance, a table of photographs with sales counts, recent
  orders, and one editor for adding or editing a photograph (drag and drop upload, inline validation).
- Light and dark themes (follows the system until you choose), lucide icons throughout, and a layout that works on phones.

## Run it

You need Node 20+ and Python 3.10+.

```bash
cp .env.example .env          # then add your Stripe test keys

# API on :5003
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python app.py

# Frontend on :5173 (proxies /api and /uploads to the API)
npm install
npm run dev
```

Open http://localhost:5173. The admin is at `/admin` (demo login `admin` / `admin123`).

With no reachable `MONGO_URI`, the API keeps products and orders in `data/store.json` and seeds the nine demo
photographs from `seed/` on first run, so it works with nothing else installed.

### Test cards

| Card | Result |
| --- | --- |
| 4242 4242 4242 4242 | Pays straight away |
| 4000 0025 0000 3155 | Asks for a 3D Secure check |
| 4000 0000 0000 0002 | Is declined |

Use any future expiry date, any CVC and any postcode.

## Layout

```
app.py            Flask API: catalogue, checkout, downloads, admin
store.py          Storage: MongoDB when reachable, otherwise a JSON file
seed/             Demo photographs and their catalogue entries
src/
  main.jsx        Routes and providers
  context/        Cart, admin session, theme, toasts
  lib/            API client, formatting, data hooks, Stripe loader
  components/ui/  Button, Field, Photo, dialogs, loading/empty/error states
  components/     Shop layout and admin layout pieces
  pages/          Home, photograph, checkout, order, admin pages
```

## Photo credits

The demo photographs are from Unsplash (Unsplash licence), served through picsum.photos: elizabeth lies, Andre Koch,
Martin Dörsch, Cornelia Büchse, Matt Benson, McDobbie Hu, Gozha Net, Biegun Wschodni and Jason Long. Each one is
credited on its own page. Replace them with your own work from the admin dashboard.
