<p align="center">
  <img src="https://img.icons8.com/3d-fluency/94/wallet.png" width="80"/>
</p>

<h1 align="center">💰 CüzdanApp</h1>

<p align="center">
  <strong>Kişisel Gelir & Gider Takip Uygulaması</strong><br/>
  <em>Ionic Framework + Angular + Firebase ile geliştirilmiştir.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Ionic-8-3880FF?style=for-the-badge&logo=ionic&logoColor=white"/>
  <img src="https://img.shields.io/badge/Angular-20-DD0031?style=for-the-badge&logo=angular&logoColor=white"/>
  <img src="https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black"/>
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
</p>

---

## 📱 Uygulama Hakkında

**CüzdanApp**, kullanıcıların gelir ve giderlerini kolayca takip edebilmesini sağlayan modern bir mobil uygulamadır. Firebase Authentication ile güvenli kullanıcı yönetimi, Firestore ile gerçek zamanlı veri senkronizasyonu sunar.

## ✨ Özellikler

| Özellik | Açıklama |
|---|---|
| 🔐 **Kullanıcı Kaydı (Sign-Up)** | E-posta ve şifre ile yeni hesap oluşturma |
| 🔑 **Kullanıcı Girişi (Sign-In)** | Güvenli giriş + "Beni Hatırla" özelliği |
| 🚪 **Kullanıcı Çıkışı (Sign-Out)** | Güvenli oturum kapatma |
| ➕ **İşlem Ekleme** | Gelir/Gider kaydı oluşturma (Firestore `addDoc`) |
| 📋 **İşlem Listeleme** | Tüm işlemleri filtreleyerek görüntüleme (Firestore `collectionData`) |
| ✏️ **İşlem Düzenleme** | Mevcut işlemleri güncelleme (Firestore `updateDoc`) |
| 🗑️ **İşlem Silme** | İşlemleri silme (Firestore `deleteDoc`) |
| 🔁 **Otomatik Tekrarlayan İşlemler** | Burs, maaş, kredi kartı gibi her ay tekrarlayan işlemler |
| 📊 **Dashboard** | Toplam bakiye, gelir ve gider özet kartları |
| 👤 **Hızlı Giriş** | Kayıtlı hesaplarla tek tıkla giriş |

## 🏗️ Proje Yapısı

```
src/
├── app/
│   ├── guards/
│   │   └── auth.guard.ts           # Auth Guard (authState + RxJS)
│   ├── models/
│   │   └── transaction.model.ts    # Veri modelleri
│   ├── pages/
│   │   ├── dashboard/              # Ana sayfa / Özet
│   │   ├── login/                  # Giriş sayfası
│   │   ├── register/               # Kayıt sayfası
│   │   ├── transactions/           # İşlem listesi
│   │   ├── transaction-form/       # İşlem ekleme/düzenleme formu
│   │   ├── recurring/              # Tekrarlayan işlemler
│   │   ├── profile/                # Kullanıcı profili
│   │   └── tabs/                   # Tab navigasyon
│   ├── services/
│   │   ├── auth.service.ts         # Firebase Authentication servisi
│   │   └── firestore.service.ts    # Firestore CRUD servisi
│   └── app.routes.ts               # Uygulama rotaları
├── environments/
│   ├── environment.ts              # Firebase yapılandırması
│   └── environment.prod.ts
└── main.ts                         # Bootstrap + Firebase providers
```

## 🔥 Firebase Veritabanı Yapısı (Subcollection)

```
kullanicilar/
└── {uid}/
    ├── ad: string
    ├── email: string
    ├── kayitTarihi: number
    ├── islemler/                    ← Gelir/Gider kayıtları
    │   └── {islemId}/
    │       ├── title: string
    │       ├── amount: number
    │       ├── type: "income" | "expense"
    │       ├── category: string
    │       ├── date: Timestamp
    │       └── tarih: number
    └── tekrarlayan_islemler/       ← Otomatik işlemler
        └── {tekrarId}/
            ├── title: string
            ├── amount: number
            ├── dayOfMonth: number
            └── isActive: boolean
```

## 🚀 Kurulum ve Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
ionic serve
```

> ⚠️ `src/environments/environment.ts` dosyasına kendi Firebase yapılandırmanızı eklemeniz gerekmektedir.

## 🛠️ Kullanılan Teknolojiler

- **Ionic Framework 8** — Mobil UI bileşenleri
- **Angular 20** — Standalone component mimarisi
- **Firebase Authentication** — Kullanıcı yönetimi
- **Firebase Firestore** — NoSQL veritabanı (Subcollection yapısı)
- **TypeScript 5.9** — Tip güvenli geliştirme
- **RxJS** — Reaktif programlama

## 📹 Demo Video

📎 [Video Linki](https://drive.google.com/file/d/1L643uFEbvmld1XoqE6jysWR-KvDj9Kjm/view?usp=sharing)

## 👨‍💻 Geliştirici

**Mustafa Tolga Güzel**
- 📧 Ankara Üniversitesi — Bilgisayar Bilimleri
- 🔗 GitHub: [@Mtolga0](https://github.com/Mtolga0)

---

<p align="center">
  <em>Mobil Uygulama Geliştirme Dersi — Final Projesi — 2026</em>
</p>
