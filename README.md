# 🦅 Yeditepe Üniversitesi - Bilgisayar Mühendisliği Kütüphanesi (SQL & Python Sürümü)

Yeditepe Üniversitesi Bilgisayar Mühendisliği bölümü öğrencileri ve kütüphane yöneticileri için geliştirilmiş; arkasında gerçek bir **SQL Veritabanı (`SQLite`)** ve **Python REST API** sunucusu çalışan, modern, şık ve yeni nesil kütüphane envanter ve ödünç takip platformu.

![Yeditepe Üniversitesi Logosu](logo.png)

## ✨ Öne Çıkan Özellikler

* 🗄️ **Gerçek SQL Veritabanı (SQLite & Python):** Veriler tarayıcının geçici hafızasında değil, sunucu tarafında çalışan gerçek bir ilişkisel veritabanı dosyasında (`kutuphane.db`) güvenle saklanır. Python'ın yerleşik `sqlite3` ve `http.server` kütüphaneleri sayesinde **hiçbir ek paket kurulumu (`pip install` vb.) gerektirmez!**
* 🎨 **Kurumsal Kimlik & Glassmorphism Tasarım:** Yeditepe Üniversitesi'nin Kraliyet Mavisi (`#2563eb`) ve Elektrik Mavisi (`#3b82f6`) renk paletiyle harmanlanmış modern cam efekti (Glassmorphism) arayüz.
* ☀️/🌙 **Gece & Gündüz Modu (İkon Odaklı):** Tek tıkla göz yormayan karanlık mod ile ferah ve aydınlık gündüz modu arasında geçiş.
* 🎓 **Öğrenci Vitrini:** Kütüphanedeki kitapların anlık rafta mı yoksa ödünçte mi olduğunu, geciken teslim tarihleriyle birlikte dinamik olarak gösteren arayüz.
* 🔐 **SQL Güvenceli Yönetici Paneli:** Yetkisiz erişimleri engelleyen şifre korumalı yönetim ekranı.
  * **Varsayılan Giriş Şifresi:** `yeditepe`
  * Panel üzerinden anlık şifre değiştirme (doğrudan SQL veritabanına işlenir).
* 📧 **Öğrenci E-posta Takibi:** Kitap ödünç alırken öğrencinin e-posta adresi de kayıt altına alınır. Admin panelinde tek tıkla öğrenciye doğrudan e-posta (`mailto:`) gönderme imkanı.
* 📚 **Tam Kapsamlı Envanter (CRUD) Yönetimi:**
  * Yeni kitap ekleme, mevcut kitap bilgileri ve kategorisi güncelleme, silme.
  * Kitap ödünç verme (1-60 gün arası esnek süre tanımlama) ve iade alma.
* 💾 **Yedekleme & Dışa Aktarma (JSON):** Tüm SQL veritabanını tek tıkla `.json` dosyası olarak indirebilir veya daha önce aldığınız yedeği doğrudan SQL tablolarına geri yükleyebilirsiniz.

---

## 🛠️ Kullanılan Teknolojiler

* **Backend / API:** Python 3 (Standart Kütüphane: `http.server`, `sqlite3`, `json`)
* **Veritabanı:** SQLite3 (İlişkisel SQL Veritabanı - `kutuphane.db`)
* **Frontend:** HTML5, Vanilla CSS3 (Glassmorphism & Duyarlı Tasarım), JavaScript ES6+ (Asenkron `fetch` REST API İstemcisi)

---

## 🚀 Başlangıç ve Çalıştırma

Projede hiçbir harici bağımlılık veya `pip/npm` yüklemesine gerek yoktur. Sadece bilgisayarınızda **Python 3** yüklü olması yeterlidir!

1. Bu depoyu bilgisayarınıza indirin veya klonlayın:
   ```bash
   git clone https://github.com/EmreTulgarlar/okul-kutuphane-app.git
   cd okul-kutuphane-app
   ```
2. Terminalinizde Python SQL sunucusunu başlatın:
   ```bash
   python server.py
   ```
   *(Sunucu başladığında otomatik olarak `kutuphane.db` SQLite dosyasını oluşturacak ve varsayılan kitapları yükleyecektir).*
3. Tarayıcınızı açın ve aşağıdaki adrese gidin:
   👉 **http://localhost:8000**
4. Yönetici paneline giriş yapmak için **`yeditepe`** şifresini kullanın!

---

## 🏛️ Lisans ve Kurumsal Bildirim
Bu proje Yeditepe Üniversitesi Bilgisayar Mühendisliği Bölümü için geliştirilmiştir. Tüm hakları saklıdır.
