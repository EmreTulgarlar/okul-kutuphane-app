#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Yeditepe Üniversitesi - Bilgisayar Mühendisliği Kütüphanesi
Python + SQLite REST API ve Statik Web Sunucusu
"""

import http.server
import json
import sqlite3
import urllib.parse
from datetime import datetime, timedelta
import os
import sys

# Windows Terminal UTF-8 Desteği
try:
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

DB_FILE = 'kutuphane.db'
PORT = 8000

# Varsayılan Bilgisayar Mühendisliği Kitapları
DEFAULT_BOOKS = [
    {
        'id': 'CSE-101', 'title': 'Introduction to Algorithms (CLRS)', 'author': 'Thomas H. Cormen',
        'category': 'Yazılım & Algoritma', 'icon': '💻', 'status': 'available',
        'student_name': None, 'student_no': None, 'student_email': None, 'borrow_date': None, 'due_date': None
    },
    {
        'id': 'CSE-102', 'title': 'Artificial Intelligence: A Modern Approach', 'author': 'Stuart Russell & Peter Norvig',
        'category': 'Yapay Zeka', 'icon': '🤖', 'status': 'borrowed',
        'student_name': 'Zeynep Aksoy', 'student_no': '202307045', 'student_email': 'zeynep.aksoy@std.yeditepe.edu.tr',
        'borrow_date': '2026-06-10', 'due_date': '2026-06-24'
    },
    {
        'id': 'CSE-103', 'title': 'Computer Networking: A Top-Down Approach', 'author': 'James F. Kurose',
        'category': 'Donanım & Sistem', 'icon': '🌐', 'status': 'available',
        'student_name': None, 'student_no': None, 'student_email': None, 'borrow_date': None, 'due_date': None
    },
    {
        'id': 'CSE-104', 'title': 'Clean Code: A Handbook of Agile Software Craftsmanship', 'author': 'Robert C. Martin',
        'category': 'Yazılım & Algoritma', 'icon': '⚡', 'status': 'borrowed',
        'student_name': 'Kaan Yıldız', 'student_no': '202207112', 'student_email': 'kaan.yildiz@std.yeditepe.edu.tr',
        'borrow_date': '2026-06-20', 'due_date': '2026-07-04'
    },
    {
        'id': 'CSE-105', 'title': 'Deep Learning', 'author': 'Ian Goodfellow & Yoshua Bengio',
        'category': 'Yapay Zeka', 'icon': '🧠', 'status': 'available',
        'student_name': None, 'student_no': None, 'student_email': None, 'borrow_date': None, 'due_date': None
    },
    {
        'id': 'CSE-106', 'title': 'Modern Operating Systems', 'author': 'Andrew S. Tanenbaum',
        'category': 'Donanım & Sistem', 'icon': '🖥️', 'status': 'available',
        'student_name': None, 'student_no': None, 'student_email': None, 'borrow_date': None, 'due_date': None
    }
]

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()
    
    # 1. Kitaplar Tablosu
    cur.execute('''
        CREATE TABLE IF NOT EXISTS books (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            category TEXT NOT NULL,
            icon TEXT,
            status TEXT DEFAULT 'available',
            student_name TEXT,
            student_no TEXT,
            student_email TEXT,
            borrow_date TEXT,
            due_date TEXT
        )
    ''')
    
    # 2. Ayarlar Tablosu (Admin Şifresi)
    cur.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    ''')
    
    # Varsayılan Şifre Kontrolü
    cur.execute("SELECT COUNT(*) FROM settings WHERE key = 'admin_password'")
    if cur.fetchone()[0] == 0:
        cur.execute("INSERT INTO settings (key, value) VALUES ('admin_password', 'yeditepe')")
        
    # Varsayılan Kitap Kontrolü
    cur.execute("SELECT COUNT(*) FROM books")
    if cur.fetchone()[0] == 0:
        print("[INFO] Veritabani bos, varsayilan Bilgisayar Muhendisligi kitaplari yukleniyor...")
        for b in DEFAULT_BOOKS:
            cur.execute('''
                INSERT INTO books (id, title, author, category, icon, status, student_name, student_no, student_email, borrow_date, due_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (b['id'], b['title'], b['author'], b['category'], b['icon'], b['status'], b['student_name'], b['student_no'], b['student_email'], b['borrow_date'], b['due_date']))
            
    conn.commit()
    conn.close()
    print(f"[OK] SQLite Veritabani ({DB_FILE}) basariyla hazirlandi.")

class LibraryRequestHandler(http.server.SimpleHTTPRequestHandler):
    def send_json(self, data, status_code=200):
        response = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(response)
        
    def get_json_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            return {}
        body_bytes = self.rfile.read(content_length)
        return json.loads(body_bytes.decode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        
        if path == '/api/books':
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM books ORDER BY id ASC")
            rows = cur.fetchall()
            books = []
            for row in rows:
                book = {
                    'id': row['id'],
                    'title': row['title'],
                    'author': row['author'],
                    'category': row['category'],
                    'icon': row['icon'],
                    'status': row['status'],
                    'borrowInfo': None
                }
                if row['status'] == 'borrowed' and row['student_name']:
                    book['borrowInfo'] = {
                        'studentName': row['student_name'],
                        'studentNo': row['student_no'],
                        'studentEmail': row['student_email'] or '',
                        'borrowDate': row['borrow_date'],
                        'dueDate': row['due_date']
                    }
                books.append(book)
            conn.close()
            return self.send_json({'success': True, 'books': books})
            
        elif path == '/api/status':
            return self.send_json({'success': True, 'engine': 'SQLite', 'status': 'online'})

        # API dışındaki tüm istekler için statik dosyaları (HTML/CSS/JS) servis et
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        parts = [p for p in path.split('/') if p] # e.g. ['api', 'books', 'CSE-101', 'lend']
        
        # 1. Şifre Doğrulama: POST /api/auth/verify
        if path == '/api/auth/verify':
            body = self.get_json_body()
            input_pwd = body.get('password', '')
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT value FROM settings WHERE key = 'admin_password'")
            real_pwd = cur.fetchone()['value']
            conn.close()
            return self.send_json({'success': True, 'valid': (input_pwd == real_pwd)})

        # 2. Şifre Değiştirme: POST /api/auth/change
        elif path == '/api/auth/change':
            body = self.get_json_body()
            old_pwd = body.get('oldPassword', '')
            new_pwd = body.get('newPassword', '')
            
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT value FROM settings WHERE key = 'admin_password'")
            real_pwd = cur.fetchone()['value']
            
            if old_pwd != real_pwd:
                conn.close()
                return self.send_json({'success': False, 'message': 'Mevcut şifreniz hatalı!'}, 400)
                
            cur.execute("UPDATE settings SET value = ? WHERE key = 'admin_password'", (new_pwd,))
            conn.commit()
            conn.close()
            return self.send_json({'success': True, 'message': 'Şifre başarıyla güncellendi.'})

        # 3. Yeni Kitap Ekle: POST /api/books
        elif path == '/api/books':
            body = self.get_json_body()
            book_id = body.get('id', '').strip().upper()
            title = body.get('title', '').strip()
            author = body.get('author', '').strip()
            category = body.get('category', 'Genel')
            icon = body.get('icon', '📚')
            
            if not book_id or not title or not author:
                return self.send_json({'success': False, 'message': 'Zorunlu alanlar eksik.'}, 400)
                
            conn = get_db()
            cur = conn.cursor()
            try:
                cur.execute('''
                    INSERT INTO books (id, title, author, category, icon, status)
                    VALUES (?, ?, ?, ?, ?, 'available')
                ''', (book_id, title, author, category, icon))
                conn.commit()
                conn.close()
                return self.send_json({'success': True, 'message': 'Kitap başarıyla eklendi.'})
            except sqlite3.IntegrityError:
                conn.close()
                return self.send_json({'success': False, 'message': f"'{book_id}' kodlu kitap zaten sistemde var!"}, 400)

        # 4. Kitap Ödünç Ver: POST /api/books/<id>/lend
        elif len(parts) == 4 and parts[0] == 'api' and parts[1] == 'books' and parts[3] == 'lend':
            book_id = parts[2]
            body = self.get_json_body()
            student_name = body.get('studentName', '').strip()
            student_no = body.get('studentNo', '').strip()
            student_email = body.get('studentEmail', '').strip()
            borrow_days = int(body.get('borrowDays', 14))
            
            now = datetime.now()
            borrow_date = now.strftime('%Y-%m-%d')
            due_date = (now + timedelta(days=borrow_days)).strftime('%Y-%m-%d')
            
            conn = get_db()
            cur = conn.cursor()
            cur.execute('''
                UPDATE books 
                SET status = 'borrowed', student_name = ?, student_no = ?, student_email = ?, borrow_date = ?, due_date = ?
                WHERE id = ?
            ''', (student_name, student_no, student_email, borrow_date, due_date, book_id))
            conn.commit()
            conn.close()
            return self.send_json({'success': True, 'message': 'Kitap ödünç verildi.'})

        # 5. Kitabı İade Al: POST /api/books/<id>/return
        elif len(parts) == 4 and parts[0] == 'api' and parts[1] == 'books' and parts[3] == 'return':
            book_id = parts[2]
            conn = get_db()
            cur = conn.cursor()
            cur.execute('''
                UPDATE books 
                SET status = 'available', student_name = NULL, student_no = NULL, student_email = NULL, borrow_date = NULL, due_date = NULL
                WHERE id = ?
            ''', (book_id,))
            conn.commit()
            conn.close()
            return self.send_json({'success': True, 'message': 'Kitap iade alındı.'})

        # 6. Yedek Yükle (Import): POST /api/import
        elif path == '/api/import':
            body = self.get_json_body()
            books = body.get('books', [])
            if not isinstance(books, list):
                return self.send_json({'success': False, 'message': 'Geçersiz format'}, 400)
                
            conn = get_db()
            cur = conn.cursor()
            cur.execute("DELETE FROM books")
            for b in books:
                info = b.get('borrowInfo') or {}
                cur.execute('''
                    INSERT INTO books (id, title, author, category, icon, status, student_name, student_no, student_email, borrow_date, due_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    b.get('id'), b.get('title'), b.get('author'), b.get('category', 'Genel'), b.get('icon', '📚'),
                    b.get('status', 'available'), info.get('studentName'), info.get('studentNo'), info.get('studentEmail'),
                    info.get('borrowDate'), info.get('dueDate')
                ))
            conn.commit()
            conn.close()
            return self.send_json({'success': True, 'message': 'Yedek başarıyla yüklendi.'})

        return self.send_json({'success': False, 'message': 'Sayfa bulunamadı'}, 404)

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        parts = [p for p in path.split('/') if p]
        
        # Kitap Düzenle: PUT /api/books/<id>
        if len(parts) == 3 and parts[0] == 'api' and parts[1] == 'books':
            book_id = parts[2]
            body = self.get_json_body()
            title = body.get('title', '').strip()
            author = body.get('author', '').strip()
            category = body.get('category', 'Genel')
            icon = body.get('icon', '📚')
            
            conn = get_db()
            cur = conn.cursor()
            cur.execute('''
                UPDATE books SET title = ?, author = ?, category = ?, icon = ? WHERE id = ?
            ''', (title, author, category, icon, book_id))
            conn.commit()
            conn.close()
            return self.send_json({'success': True, 'message': 'Kitap güncellendi.'})

        return self.send_json({'success': False, 'message': 'Geçersiz istek'}, 400)

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        parts = [p for p in path.split('/') if p]
        
        # Kitap Sil: DELETE /api/books/<id>
        if len(parts) == 3 and parts[0] == 'api' and parts[1] == 'books':
            book_id = parts[2]
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT status FROM books WHERE id = ?", (book_id,))
            row = cur.fetchone()
            if not row:
                conn.close()
                return self.send_json({'success': False, 'message': 'Kitap bulunamadı'}, 404)
            if row['status'] == 'borrowed':
                conn.close()
                return self.send_json({'success': False, 'message': 'Ödünçteki kitap silinemez!'}, 400)
                
            cur.execute("DELETE FROM books WHERE id = ?", (book_id,))
            conn.commit()
            conn.close()
            return self.send_json({'success': True, 'message': 'Kitap silindi.'})

        return self.send_json({'success': False, 'message': 'Geçersiz istek'}, 400)

def run_server():
    init_db()
    server_address = ('', PORT)
    httpd = http.server.HTTPServer(server_address, LibraryRequestHandler)
    print(f"[START] Yeditepe Kutuphane SQL Sunucusu calisiyor: http://localhost:{PORT}")
    print("[INFO] Sunucuyu durdurmak icin CTRL+C tuslarina basabilirsiniz.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[STOP] Sunucu kapatiliyor...")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
