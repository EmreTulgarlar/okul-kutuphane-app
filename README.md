# 🦅 Yeditepe Üniversitesi - Bilgisayar Mühendisliği Kütüphanesi

Yeditepe Üniversitesi Bilgisayar Mühendisliği bölümü öğrencileri ve kütüphane yöneticileri için özel olarak tasarlanmış, modern, şık ve yeni nesil web tabanlı kütüphane envanter ve ödünç takip platformu.

![Yeditepe Üniversitesi Logosu](logo.png)

## ✨ Öne Çıkan Özellikler

* 🎨 **Kurumsal Kimlik & Glassmorphism Tasarım:** Yeditepe Üniversitesi'nin Kraliyet Mavisi (`#2563eb`) ve Elektrik Mavisi (`#3b82f6`) renk paletiyle harmanlanmış modern cam efekti (Glassmorphism) arayüz.
* ☀️/🌙 **Gece & Gündüz Modu (İkon Odaklı):** Tek tıkla göz yormayan karanlık mod ile ferah ve aydınlık gündüz modu arasında geçiş. Seçilen tema tarayıcı hafızasında (`localStorage`) otomatik saklanır.
* 🎓 **Öğrenci Vitrini:** Kütüphanedeki kitapların anlık rafta mı yoksa ödünçte mi olduğunu, geciken teslim tarihleriyle birlikte dinamik olarak gösteren arayüz.
* 🔐 **Şifreli Yönetici Paneli:** Yetkisiz erişimleri engelleyen şifre korumalı yönetim ekranı.
  * **Varsayılan Giriş Şifresi:** `yeditepe`
  * Panel üzerinden anlık şifre değiştirme ve güvenli oturum yönetimi.
* 📧 **Öğrenci E-posta Takibi:** Kitap ödünç alırken öğrencinin e-posta adresi de kayıt altına alınır. Admin panelinde tek tıkla öğrenciye doğrudan e-posta (`mailto:`) gönderme imkanı.
* 📚 **Tam Kapsamlı Envanter (CRUD) Yönetimi:**
  * Yeni kitap ekleme, mevcut kitap bilgileri ve kategorisi güncelleme, silme.
  * Kitap ödünç verme (1-60 gün arası esnek süre tanımlama) ve iade alma.
* 💾 **Yedekleme & Dışa Aktarma (JSON):** Tüm kütüphane veritabanını tek tıkla `.json` dosyası olarak bilgisayarınıza indirebilir veya daha önce aldığınız yedeği sisteme geri yükleyebilirsiniz.
* ⚡ **Sıfır Kurulum & Yerel Hafıza (LocalStorage):** Hiçbir harici veritabanı kurulumu gerektirmez. Tüm veriler doğrudan tarayıcınızın yerel hafızasında güvenle tutulur.

---

## 🛠️ Kullanılan Teknolojiler

* **HTML5:** Semantik, erişilebilir ve modern web iskeleti.
* **Vanilla CSS3:** Özel CSS değişkenleri (`:root`), Glassmorphism ışık efektleri, duyarlı (responsive) ızgara (grid) tasarımı ve animasyonlar.
* **JavaScript (ES6+):** Tek sayfa uygulaması (SPA) mimarisi, dinamik DOM manipülasyonu, form doğrulama ve state yönetimi.
* **Web Storage API:** Veri kalıcılığı için `localStorage` entegrasyonu.

---

## 🚀 Başlangıç ve Çalıştırma

Projede herhangi bir sunucu veya bağımlılık yüklemeye gerek yoktur. 

1. Bu depoyu bilgisayarınıza indirin veya klonlayın:
   ```bash
   git clone https://github.com/KULLANICI_ADINIZ/okul-kutuphane-app.git
   ```
2. Klasör içindeki `index.html` dosyasına çift tıklayarak favori tarayıcınızda (Chrome, Edge, Safari, Firefox vb.) hemen açın.
3. Yönetici paneline giriş yapmak için **`yeditepe`** şifresini kullanın!

---

## 🏛️ Lisans ve Kurumsal Bildirim
Bu proje Yeditepe Üniversitesi Bilgisayar Mühendisliği Bölümü için geliştirilmiştir. Tüm hakları saklıdır.
