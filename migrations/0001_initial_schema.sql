-- 医療機器マスターテーブル
CREATE TABLE IF NOT EXISTS medical_devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_name TEXT NOT NULL,
    model_number TEXT NOT NULL,
    management_number TEXT UNIQUE NOT NULL,
    vendor_name TEXT NOT NULL,
    emergency_phone TEXT NOT NULL,
    purchase_date DATE NOT NULL,
    image_url TEXT,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 消耗品テーブル
CREATE TABLE IF NOT EXISTS consumables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER NOT NULL,
    consumable_name TEXT NOT NULL,
    part_number TEXT,
    price DECIMAL(10, 2) NOT NULL,
    unit TEXT DEFAULT 'piece',
    vendor_name TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES medical_devices(id) ON DELETE CASCADE
);

-- 機器画像テーブル（複数画像対応）
CREATE TABLE IF NOT EXISTS device_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    image_type TEXT DEFAULT 'main', -- 'main', 'manual', 'parts', etc.
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES medical_devices(id) ON DELETE CASCADE
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_devices_management_number ON medical_devices(management_number);
CREATE INDEX IF NOT EXISTS idx_devices_vendor ON medical_devices(vendor_name);
CREATE INDEX IF NOT EXISTS idx_consumables_device_id ON consumables(device_id);
CREATE INDEX IF NOT EXISTS idx_device_images_device_id ON device_images(device_id);
CREATE INDEX IF NOT EXISTS idx_device_images_type ON device_images(image_type);