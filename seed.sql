-- サンプルデータの挿入

-- 医療機器のサンプルデータ
INSERT OR IGNORE INTO medical_devices (
    device_name, model_number, management_number, vendor_name, 
    emergency_phone, purchase_date, description, status
) VALUES 
    ('心電図モニター', 'ECG-2000X', 'MD-001', '医療機器商事', '03-1234-5678', '2023-01-15', '12誘導心電図モニター、タッチパネル操作', 'active'),
    ('超音波診断装置', 'US-500Pro', 'MD-002', 'メディカルテック', '06-9876-5432', '2023-03-20', 'カラードプラ機能付き超音波診断装置', 'active'),
    ('血圧計', 'BP-Auto200', 'MD-003', '測定器専門店', '03-5555-1111', '2022-11-10', '自動血圧計、デジタル表示', 'active'),
    ('人工呼吸器', 'VENT-Pro3000', 'MD-004', 'ライフサポート', '24-時間-対応', '2023-06-05', 'ICU対応人工呼吸器、アラーム機能付き', 'active');

-- 消耗品のサンプルデータ
INSERT OR IGNORE INTO consumables (device_id, consumable_name, part_number, price, unit, vendor_name, notes) VALUES 
    -- 心電図モニター用
    (1, '電極パッド', 'ECG-PAD-01', 150.00, 'piece', '医療機器商事', '使い捨て、50枚入り'),
    (1, '記録紙', 'ECG-PAPER-A4', 800.00, 'roll', '医療機器商事', 'A4サイズ、100m巻'),
    (1, 'ケーブル', 'ECG-CABLE-12L', 15000.00, 'piece', '医療機器商事', '12誘導用ケーブル'),
    
    -- 超音波診断装置用
    (2, 'プローブカバー', 'US-COVER-STD', 80.00, 'piece', 'メディカルテック', '滅菌済み、100枚入り'),
    (2, 'カップリングゲル', 'US-GEL-500ML', 1200.00, 'bottle', 'メディカルテック', '500ml、水溶性'),
    
    -- 血圧計用
    (3, 'カフ（成人用）', 'BP-CUFF-ADULT', 3500.00, 'piece', '測定器専門店', '成人用標準サイズ'),
    (3, 'カフ（小児用）', 'BP-CUFF-CHILD', 3200.00, 'piece', '測定器専門店', '小児用サイズ'),
    
    -- 人工呼吸器用
    (4, '呼吸回路', 'VENT-CIRCUIT-01', 2500.00, 'set', 'ライフサポート', '使い捨て呼吸回路一式'),
    (4, 'フィルター', 'VENT-FILTER-HME', 450.00, 'piece', 'ライフサポート', 'HMEフィルター');