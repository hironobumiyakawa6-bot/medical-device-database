import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)

// CORS設定
app.use('/api/*', cors())

// 静的ファイル配信
app.use('/static/*', serveStatic({ root: './public' }))

// ==================
// API エンドポイント
// ==================

// データベース初期化エンドポイント
app.post('/api/init-db', async (c) => {
  const { env } = c
  
  try {
    // 医療機器マスターテーブル
    await env.DB.prepare(`
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
      )
    `).run()
    
    // 消耗品テーブル
    await env.DB.prepare(`
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
      )
    `).run()
    
    // 機器画像テーブル
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS device_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          device_id INTEGER NOT NULL,
          image_url TEXT NOT NULL,
          image_type TEXT DEFAULT 'main',
          caption TEXT,
          sort_order INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (device_id) REFERENCES medical_devices(id) ON DELETE CASCADE
      )
    `).run()
    
    // インデックス作成
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_devices_management_number ON medical_devices(management_number)`).run()
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_devices_vendor ON medical_devices(vendor_name)`).run()
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_consumables_device_id ON consumables(device_id)`).run()
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_device_images_device_id ON device_images(device_id)`).run()
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_device_images_type ON device_images(image_type)`).run()
    
    return c.json({ success: true, message: 'Database initialized successfully' })
  } catch (error) {
    console.error('Database initialization error:', error)
    return c.json({ error: 'Failed to initialize database', details: error.message }, 500)
  }
})

// サンプルデータ投入エンドポイント
app.post('/api/seed-data', async (c) => {
  const { env } = c
  
  try {
    // サンプル医療機器データ
    const devices = [
      {
        device_name: '心電図モニター',
        model_number: 'ECG-2000X',
        management_number: 'MD-001',
        vendor_name: '医療機器商事',
        emergency_phone: '03-1234-5678',
        purchase_date: '2023-01-15',
        description: '12誘導心電図モニター、タッチパネル操作'
      },
      {
        device_name: '超音波診断装置',
        model_number: 'US-500Pro',
        management_number: 'MD-002',
        vendor_name: 'メディカルテック',
        emergency_phone: '06-9876-5432',
        purchase_date: '2023-03-20',
        description: 'カラードプラ機能付き超音波診断装置'
      },
      {
        device_name: '血圧計',
        model_number: 'BP-Auto200',
        management_number: 'MD-003',
        vendor_name: '測定器専門店',
        emergency_phone: '03-5555-1111',
        purchase_date: '2022-11-10',
        description: '自動血圧計、デジタル表示'
      },
      {
        device_name: '人工呼吸器',
        model_number: 'VENT-Pro3000',
        management_number: 'MD-004',
        vendor_name: 'ライフサポート',
        emergency_phone: '24-時間-対応',
        purchase_date: '2023-06-05',
        description: 'ICU対応人工呼吸器、アラーム機能付き'
      }
    ]
    
    for (const device of devices) {
      const result = await env.DB.prepare(`
        INSERT OR IGNORE INTO medical_devices (
          device_name, model_number, management_number, vendor_name,
          emergency_phone, purchase_date, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        device.device_name, device.model_number, device.management_number,
        device.vendor_name, device.emergency_phone, device.purchase_date, device.description
      ).run()
    }
    
    // サンプル消耗品データ
    const consumables = [
      { device_id: 1, consumable_name: '電極パッド', part_number: 'ECG-PAD-01', price: 150.00, unit: '個', vendor_name: '医療機器商事', notes: '使い捨て、50枚入り' },
      { device_id: 1, consumable_name: '記録紙', part_number: 'ECG-PAPER-A4', price: 800.00, unit: 'roll', vendor_name: '医療機器商事', notes: 'A4サイズ、100m巻' },
      { device_id: 2, consumable_name: 'プローブカバー', part_number: 'US-COVER-STD', price: 80.00, unit: '個', vendor_name: 'メディカルテック', notes: '滅菌済み、100枚入り' },
      { device_id: 2, consumable_name: 'カップリングゲル', part_number: 'US-GEL-500ML', price: 1200.00, unit: 'bottle', vendor_name: 'メディカルテック', notes: '500ml、水溶性' },
      { device_id: 3, consumable_name: 'カフ（成人用）', part_number: 'BP-CUFF-ADULT', price: 3500.00, unit: '個', vendor_name: '測定器専門店', notes: '成人用標準サイズ' },
      { device_id: 4, consumable_name: '呼吸回路', part_number: 'VENT-CIRCUIT-01', price: 2500.00, unit: 'set', vendor_name: 'ライフサポート', notes: '使い捨て呼吸回路一式' }
    ]
    
    for (const consumable of consumables) {
      await env.DB.prepare(`
        INSERT OR IGNORE INTO consumables (
          device_id, consumable_name, part_number, price, unit, vendor_name, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        consumable.device_id, consumable.consumable_name, consumable.part_number,
        consumable.price, consumable.unit, consumable.vendor_name, consumable.notes
      ).run()
    }
    
    return c.json({ success: true, message: 'Sample data seeded successfully' })
  } catch (error) {
    console.error('Seed data error:', error)
    return c.json({ error: 'Failed to seed data', details: error.message }, 500)
  }
})

// 医療機器一覧取得
app.get('/api/devices', async (c) => {
  const { env } = c
  
  try {
    const result = await env.DB.prepare(`
      SELECT * FROM medical_devices 
      WHERE status = 'active' 
      ORDER BY created_at DESC
    `).all()
    
    return c.json(result.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch devices' }, 500)
  }
})

// 医療機器詳細取得
app.get('/api/devices/:id', async (c) => {
  const { env } = c
  const deviceId = c.req.param('id')
  
  try {
    // 機器情報取得
    const deviceResult = await env.DB.prepare(`
      SELECT * FROM medical_devices WHERE id = ?
    `).bind(deviceId).first()
    
    if (!deviceResult) {
      return c.json({ error: 'Device not found' }, 404)
    }
    
    // 消耗品情報取得
    const consumablesResult = await env.DB.prepare(`
      SELECT * FROM consumables WHERE device_id = ? ORDER BY consumable_name
    `).bind(deviceId).all()
    
    // 画像情報取得
    const imagesResult = await env.DB.prepare(`
      SELECT * FROM device_images WHERE device_id = ? ORDER BY sort_order, id
    `).bind(deviceId).all()
    
    return c.json({
      device: deviceResult,
      consumables: consumablesResult.results,
      images: imagesResult.results
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch device details' }, 500)
  }
})

// 医療機器新規作成
app.post('/api/devices', async (c) => {
  const { env } = c
  
  try {
    const body = await c.req.json()
    const {
      device_name,
      model_number,
      management_number,
      vendor_name,
      emergency_phone,
      purchase_date,
      description
    } = body
    
    const result = await env.DB.prepare(`
      INSERT INTO medical_devices (
        device_name, model_number, management_number, vendor_name,
        emergency_phone, purchase_date, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      device_name, model_number, management_number, vendor_name,
      emergency_phone, purchase_date, description
    ).run()
    
    return c.json({ id: result.meta.last_row_id, ...body })
  } catch (error) {
    return c.json({ error: 'Failed to create device' }, 500)
  }
})

// 医療機器更新
app.put('/api/devices/:id', async (c) => {
  const { env } = c
  const deviceId = c.req.param('id')
  
  try {
    const body = await c.req.json()
    const {
      device_name,
      model_number,
      management_number,
      vendor_name,
      emergency_phone,
      purchase_date,
      description
    } = body
    
    await env.DB.prepare(`
      UPDATE medical_devices SET
        device_name = ?, model_number = ?, management_number = ?,
        vendor_name = ?, emergency_phone = ?, purchase_date = ?,
        description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      device_name, model_number, management_number, vendor_name,
      emergency_phone, purchase_date, description, deviceId
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to update device' }, 500)
  }
})

// 消耗品追加
app.post('/api/devices/:id/consumables', async (c) => {
  const { env } = c
  const deviceId = c.req.param('id')
  
  try {
    const body = await c.req.json()
    const { consumable_name, part_number, price, unit, vendor_name, notes } = body
    
    const result = await env.DB.prepare(`
      INSERT INTO consumables (
        device_id, consumable_name, part_number, price, unit, vendor_name, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(deviceId, consumable_name, part_number, price, unit, vendor_name, notes).run()
    
    return c.json({ id: result.meta.last_row_id, device_id: deviceId, ...body })
  } catch (error) {
    return c.json({ error: 'Failed to add consumable' }, 500)
  }
})

// 消耗品削除
app.delete('/api/consumables/:id', async (c) => {
  const { env } = c
  const consumableId = c.req.param('id')
  
  try {
    await env.DB.prepare(`DELETE FROM consumables WHERE id = ?`).bind(consumableId).run()
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to delete consumable' }, 500)
  }
})

// 画像アップロード
app.post('/api/devices/:id/images', async (c) => {
  const { env } = c
  const deviceId = c.req.param('id')
  
  try {
    const formData = await c.req.formData()
    const file = formData.get('image') as File
    const caption = formData.get('caption') as string || ''
    const imageType = formData.get('image_type') as string || 'main'
    
    if (!file) {
      return c.json({ error: 'No image file provided' }, 400)
    }
    
    // ファイル名生成（デバイスID + タイムスタンプ + 元のファイル名）
    const timestamp = Date.now()
    const originalName = file.name
    const extension = originalName.split('.').pop()
    const fileName = `device_${deviceId}_${timestamp}.${extension}`
    
    // R2にファイルをアップロード
    const arrayBuffer = await file.arrayBuffer()
    await env.R2.put(fileName, arrayBuffer, {
      httpMetadata: {
        contentType: file.type
      }
    })
    
    // データベースに画像情報を保存
    const imageUrl = `/api/images/${fileName}`
    const result = await env.DB.prepare(`
      INSERT INTO device_images (device_id, image_url, image_type, caption)
      VALUES (?, ?, ?, ?)
    `).bind(deviceId, imageUrl, imageType, caption).run()
    
    return c.json({
      id: result.meta.last_row_id,
      device_id: deviceId,
      image_url: imageUrl,
      image_type: imageType,
      caption: caption
    })
  } catch (error) {
    console.error('Image upload error:', error)
    return c.json({ error: 'Failed to upload image' }, 500)
  }
})

// 画像取得
app.get('/api/images/:filename', async (c) => {
  const { env } = c
  const filename = c.req.param('filename')
  
  try {
    const object = await env.R2.get(filename)
    
    if (!object) {
      return c.notFound()
    }
    
    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000' // 1年間キャッシュ
      }
    })
  } catch (error) {
    console.error('Image fetch error:', error)
    return c.json({ error: 'Failed to fetch image' }, 500)
  }
})

// 画像削除
app.delete('/api/images/:id', async (c) => {
  const { env } = c
  const imageId = c.req.param('id')
  
  try {
    // データベースから画像情報を取得
    const imageInfo = await env.DB.prepare(`
      SELECT * FROM device_images WHERE id = ?
    `).bind(imageId).first()
    
    if (!imageInfo) {
      return c.json({ error: 'Image not found' }, 404)
    }
    
    // R2から画像ファイルを削除
    const filename = imageInfo.image_url.split('/').pop()
    await env.R2.delete(filename)
    
    // データベースから画像レコードを削除
    await env.DB.prepare(`DELETE FROM device_images WHERE id = ?`).bind(imageId).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Image delete error:', error)
    return c.json({ error: 'Failed to delete image' }, 500)
  }
})

// ==================
// フロントエンド ページ
// ==================

// メインページ（機器一覧）
app.get('/', (c) => {
  return c.render(
    <div>
      <h1>医療機器データベース</h1>
      <div id="app">
        <div className="loading">データを読み込み中...</div>
      </div>
    </div>
  )
})

// 機器詳細ページ
app.get('/device/:id', (c) => {
  const deviceId = c.req.param('id')
  return c.render(
    <div>
      <h1>医療機器詳細</h1>
      <div id="app" data-device-id={deviceId}>
        <div className="loading">データを読み込み中...</div>
      </div>
    </div>
  )
})

// 機器追加ページ
app.get('/add', (c) => {
  return c.render(
    <div>
      <h1>医療機器追加</h1>
      <div id="app">
        <div className="loading">フォームを読み込み中...</div>
      </div>
    </div>
  )
})

// 機器編集ページ
app.get('/edit/:id', (c) => {
  const deviceId = c.req.param('id')
  return c.render(
    <div>
      <h1>医療機器編集</h1>
      <div id="app" data-device-id={deviceId}>
        <div className="loading">データを読み込み中...</div>
      </div>
    </div>
  )
})

export default app
