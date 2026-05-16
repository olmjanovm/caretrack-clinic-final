# CareTrack Clinic — Test Rejasi

## 1. Login testlari

### 1.1 Admin login
- [ ] `admin` / `admin123` bilan kirish
- [ ] Dashboard sahifasiga yo'naltirilishi
- [ ] Sidebarida "Boshqaruv paneli, Shifokorlar, Bemorlar, Tashxislar, Hisobotlar" ko'rinishi
- [ ] User info: "Admin User" ismi va "Administrator" badge ko'rinishi

### 1.2 Clinician login
- [ ] `clinician` / `clinician123` bilan kirish
- [ ] Sidebarida faqat: Boshqaruv paneli, Shifokorlar, Bemorlar, Tashxislar
- [ ] Hisobotlar menyu elementi ko'rinmasligi
- [ ] "Klinitsist" badge ko'rinishi

### 1.3 Receptionist login
- [ ] `receptionist` / `reception123` bilan kirish
- [ ] Sidebarida faqat: Boshqaruv paneli, Shifokorlar, Bemorlar
- [ ] Tashxislar va Hisobotlar ko'rinmasligi
- [ ] "Qabulxona xodimi" badge ko'rinishi

### 1.4 Noto'g'ri login
- [ ] Xato parol bilan kirish → xato xabari
- [ ] Bo'sh maydon bilan kirish → validatsiya xabari

### 1.5 Logout
- [ ] Chiqish tugmasi ishlashi
- [ ] Login sahifasiga qaytish
- [ ] Sessiya tozalanishi (brauzer orqaga bosganda login talab etilishi)

---

## 2. Doctor CRUD (faqat admin)

### 2.1 Ko'rish
- [ ] Shifokorlar ro'yxati to'g'ri yuklanishi
- [ ] Qidiruv: ism bo'yicha filtrlash
- [ ] Bo'lim filtri ishlashi
- [ ] Holat filtri ishlashi

### 2.2 Qo'shish (admin)
- [ ] "Yangi shifokor" tugmasi bosilganda modal ochilishi
- [ ] Majburiy maydonlar bo'sh → xato xabari
- [ ] Noto'g'ri email → validatsiya xabari
- [ ] To'g'ri ma'lumotlar → shifokor qo'shilishi, toast

### 2.3 Tahrirlash (admin)
- [ ] Tahrirlash tugmasi → modal ma'lumotlar bilan ochilishi
- [ ] O'zgartirib saqlash → yangilangani ko'rinishi

### 2.4 O'chirish (admin)
- [ ] O'chirish tugmasi → tasdiqlash dialogi
- [ ] Tasdiqlash → shifokor o'chirilishi

### 2.5 Ruxsat cheklovi (clinician/receptionist)
- [ ] "Yangi shifokor" tugmasi ko'rinmasligi
- [ ] Tahrirlash/O'chirish tugmalari ko'rinmasligi

---

## 3. Patient CRUD

### 3.1 Ko'rish (barcha rollar)
- [ ] Bemorlar ro'yxati to'g'ri yuklanishi
- [ ] Qidiruv ishlashi
- [ ] Shifokor filtri ishlashi
- [ ] Jins filtri ishlashi

### 3.2 Qo'shish (admin + receptionist)
- [ ] "Yangi bemor" tugmasi admin va receptionist uchun ko'rinishi
- [ ] Clinician uchun ko'rinmasligi
- [ ] Validatsiya ishlashi
- [ ] Qo'shilgandan keyin ro'yxat yangilanishi

### 3.3 Tahrirlash (admin + clinician)
- [ ] Tahrirlash tugmasi admin va clinician uchun ko'rinishi
- [ ] Receptionist uchun ko'rinmasligi

### 3.4 O'chirish (faqat admin)
- [ ] O'chirish tugmasi faqat admin uchun ko'rinishi

### 3.5 Profil ko'rish (barcha rollar)
- [ ] "Ko'rish" tugmasi barcha rollarda ko'rinishi
- [ ] Profil sahifasiga o'tish

---

## 4. Diagnosis CRUD

### 4.1 Ruxsat cheklovi
- [ ] Receptionist `/diagnoses.html` ga kirsa → "Ruxsat yo'q" xabari
- [ ] Admin va clinician kirishi mumkin

### 4.2 Ko'rish (admin + clinician)
- [ ] Tashxislar ro'yxati to'g'ri yuklanishi
- [ ] ICD kodi/sarlavha bo'yicha qidiruv
- [ ] Daraja filtri ishlashi
- [ ] Bemor filtri ishlashi

### 4.3 Qo'shish (admin + clinician)
- [ ] "Yangi tashxis" modal ochilishi
- [ ] Majburiy maydonlar validatsiyasi
- [ ] Daraja tanlanmasa → xato

### 4.4 Tahrirlash (admin + clinician)

### 4.5 O'chirish (faqat admin)

---

## 5. Patient profile sahifasi

- [ ] URL: `/patient-profile.html?id=p1`
- [ ] Bemor ma'lumotlari kartasi ko'rinishi
- [ ] Biriktirilgan shifokor kartasi ko'rinishi
- [ ] Tashxis tarixi timeline ko'rinishi
- [ ] Severity badge ranglari to'g'ri
- [ ] Tashxis yo'q bo'lsa → "Tashxislar yo'q" xabari
- [ ] "Orqaga" tugmasi bemorlar sahifasiga qaytarishi
- [ ] "Chop etish" tugmasi print dialogi ochishi

---

## 6. Dashboard rol farqlari

### Admin dashboard
- [ ] 4 ta stat karta: Shifokorlar, Bemorlar, Tashxislar, Kritik
- [ ] So'nggi bemorlar ro'yxati
- [ ] Og'irlik taqsimoti bar chart
- [ ] So'nggi tashxislar ro'yxati

### Clinician dashboard
- [ ] 3 ta stat karta: Bemorlar, Tashxislar, Kritik
- [ ] So'nggi bemorlar va tashxislar ko'rinishi

### Receptionist dashboard
- [ ] 4 ta stat karta: Jami shifokorlar, Mavjud shifokorlar, Jami bemorlar, Bugun ro'yxatga olingan
- [ ] "Yangi bemor qo'shish" shortcut tugmasi
- [ ] Tashxis statistikasi ko'rinmasligi

---

## 7. Reports sahifasi (faqat admin)

- [ ] Clinician `/reports.html` ga kirsa → "Ruxsat yo'q"
- [ ] Receptionist `/reports.html` ga kirsa → "Ruxsat yo'q"
- [ ] Admin kirishi mumkin
- [ ] 4 ta summary karta
- [ ] Daraja bo'yicha bar chart
- [ ] Bo'limlar bo'yicha bemorlar grafigi
- [ ] Yuqori/Kritik tashxislar jadvali
- [ ] "Chop etish" tugmasi ishlashi

---

## 8. Qidiruv va filter

- [ ] Shifokorlar: ism + bo'lim + holat filtrlari
- [ ] Bemorlar: ism + shifokor + jins filtrlari
- [ ] Tashxislar: ICD/sarlavha + daraja + bemor filtrlari
- [ ] Natija topilmasa → "Topilmadi" xabari

---

## 9. Validatsiya testlari

- [ ] Bo'sh maydonlar — xato xabari
- [ ] Email formati — `test@test.com`
- [ ] Telefon to'ldirilgan
- [ ] Sanalar to'g'ri formatda
- [ ] Shifokor tanlanmagan bemor uchun xato
- [ ] Bemor tanlanmagan tashxis uchun xato

---

## 10. UI/UX testlari

- [ ] Teal/yashil rang palitrasiga mos dizayn
- [ ] Modal animatsiyasi silliq ochilishi
- [ ] Toast xabarlari pastda o'ng tomonda chiqishi
- [ ] Tasdiqlash dialogi to'g'ri ishlashi
- [ ] Jadval ustunlari qimirlamasligi (overflow:auto)
- [ ] Print rejimida sidebar va tugmalar yashirinishi
- [ ] Barcha havolalar to'g'ri ishlashi
