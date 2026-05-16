# CareTrack Clinic — Tibbiy Yozuvlarni Boshqarish Tizimi

## Loyiha haqida

CareTrack Clinic — bu klinika ichki xodimlari uchun mo'ljallangan tibbiy yozuvlarni boshqarish tizimi. Bu ommaviy bemor portali emas, balki **ichki klinika xodimlari tizimi**dir. Bemorlar tizimga kirmaydi — faqat klinika xodimlari (admin, klinitsist, qabulxona xodimi) kirishlari mumkin.

## Texnologiyalar

**Frontend:**
- HTML5
- CSS3 (Custom Properties, Grid, Flexbox)
- Vanilla JavaScript (ES6+)

**Backend:**
- Node.js
- Express.js
- express-session (sessiya boshqaruvi)

**Ma'lumotlar:**
- JSON fayllar (`data/` papkasida)

## O'rnatish va ishga tushirish

```bash
# 1. Dependencylarni o'rnatish
npm install

# 2. Serverni ishga tushirish
npm start

# 3. Brauzerda ochish
http://localhost:3000
```

## Login ma'lumotlari (Demo)

| Foydalanuvchi | Parol          | Rol           |
|---------------|----------------|---------------|
| admin         | admin123       | Administrator |
| clinician     | clinician123   | Klinitsist    |
| receptionist  | reception123   | Qabulxona     |

## Papka tuzilmasi

```
caretrack-clinic-final/
  package.json          — npm konfiguratsiyasi
  server.js             — Express backend va REST API
  data/
    users.json          — Foydalanuvchilar va parollar
    doctors.json        — Shifokorlar ma'lumotlari
    patients.json       — Bemorlar ma'lumotlari
    diagnoses.json      — Tashxislar ma'lumotlari
  public/
    login.html          — Kirish sahifasi
    dashboard.html      — Boshqaruv paneli
    doctors.html        — Shifokorlar ro'yxati
    patients.html       — Bemorlar ro'yxati
    patient-profile.html— Bemor profili
    diagnoses.html      — Tashxislar ro'yxati
    reports.html        — Hisobotlar (admin only)
    css/
      style.css         — Asosiy stillar
    js/
      auth.js           — Autentifikatsiya logikasi
      api.js            — REST API chaqiruvlari
      layout.js         — Sidebar, topbar, modal, toast
      dashboard.js      — Dashboard sahifasi
      doctors.js        — Shifokorlar sahifasi
      patients.js       — Bemorlar sahifasi
      patientProfile.js — Bemor profili sahifasi
      diagnoses.js      — Tashxislar sahifasi
      reports.js        — Hisobotlar sahifasi
  README.md
  TEST_PLAN.md
```

## Sahifalar

1. **login.html** — Kirish sahifasi, demo hisoblar bilan
2. **dashboard.html** — Rol asosidagi statistika va umumiy ko'rinish
3. **doctors.html** — Shifokorlar ro'yxati, qidirish, filter
4. **patients.html** — Bemorlar ro'yxati, qidirish, filter
5. **patient-profile.html** — Bemor ma'lumotlari + tashxis tarixi
6. **diagnoses.html** — Tashxislar ro'yxati (admin + clinician)
7. **reports.html** — Klinika hisobotlari (faqat admin)

## Rol ruxsatlari

| Imkoniyat              | Admin | Clinician | Receptionist |
|------------------------|:-----:|:---------:|:------------:|
| Dashboard ko'rish      | ✅    | ✅        | ✅           |
| Shifokorlar ko'rish    | ✅    | ✅        | ✅           |
| Shifokor qo'shish      | ✅    | ❌        | ❌           |
| Shifokor tahrirlash    | ✅    | ❌        | ❌           |
| Shifokor o'chirish     | ✅    | ❌        | ❌           |
| Bemorlar ko'rish       | ✅    | ✅        | ✅           |
| Bemor qo'shish         | ✅    | ❌        | ✅           |
| Bemor tahrirlash       | ✅    | ✅        | ❌           |
| Bemor o'chirish        | ✅    | ❌        | ❌           |
| Tashxislar ko'rish     | ✅    | ✅        | ❌           |
| Tashxis qo'shish       | ✅    | ✅        | ❌           |
| Tashxis tahrirlash     | ✅    | ✅        | ❌           |
| Tashxis o'chirish      | ✅    | ❌        | ❌           |
| Hisobotlar             | ✅    | ❌        | ❌           |

## Demo ma'lumotlar

- 8 ta shifokor (Cardiology, Neurology, Dermatology, Orthopedics, General Practice, Diagnostics bo'limlari)
- 20 ta bemor
- 30 ta tashxis (Past, O'rta, Yuqori, Kritik darajalari)

## Cheklovlar

- Parollar oddiy tekst (hashlanmagan) — haqiqiy tizimda bcrypt ishlatish kerak
- JSON fayl asosida — ko'p foydalanuvchi bir vaqtda yozsa muammo bo'lishi mumkin
- Express-session xotirada saqlanadi — server qayta ishga tushsa sessiyalar o'chadi

## Kelajak takomillashtirish

- Bcrypt bilan parol hashlash
- SQLite yoki PostgreSQL ma'lumotlar bazasi
- JWT autentifikatsiya
- Rasm yuklash (shifokor/bemor foto)
- Email xabarnoma tizimi
- Tug'ilgan kun va uchrashuvlar eslatmasi
