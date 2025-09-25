// 医療機器データベース フロントエンド JavaScript

class MedicalDeviceApp {
    constructor() {
        this.apiBase = '/api';
        this.init();
    }

    init() {
        const path = window.location.pathname;
        
        if (path === '/') {
            this.loadDeviceList();
        } else if (path.startsWith('/device/')) {
            const deviceId = path.split('/')[2];
            this.loadDeviceDetail(deviceId);
        } else if (path === '/add') {
            this.showAddDeviceForm();
        } else if (path.startsWith('/edit/')) {
            const deviceId = path.split('/')[2];
            this.loadEditDeviceForm(deviceId);
        }
    }

    // 機器一覧表示
    async loadDeviceList() {
        try {
            const response = await axios.get(`${this.apiBase}/devices`);
            const devices = response.data;
            
            const html = `
                <div class="mb-6">
                    <h2 class="text-2xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-list mr-2"></i>医療機器一覧
                    </h2>
                    <div class="bg-white rounded-lg shadow">
                        ${devices.length === 0 ? 
                            '<p class="p-8 text-gray-500 text-center">登録されている機器がありません</p>' :
                            devices.map(device => `
                                <div class="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                                    <div class="flex justify-between items-start">
                                        <div class="flex-1">
                                            <h3 class="text-lg font-semibold text-blue-600">
                                                <a href="/device/${device.id}" class="hover:underline">
                                                    ${device.device_name}
                                                </a>
                                            </h3>
                                            <p class="text-gray-600">型番: ${device.model_number}</p>
                                            <p class="text-gray-600">管理番号: ${device.management_number}</p>
                                            <p class="text-gray-600">業者: ${device.vendor_name}</p>
                                            <p class="text-gray-500 text-sm">購入日: ${device.purchase_date}</p>
                                        </div>
                                        <div class="flex space-x-2">
                                            <a href="/device/${device.id}" 
                                               class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors">
                                                <i class="fas fa-eye mr-1"></i>詳細
                                            </a>
                                            <a href="/edit/${device.id}" 
                                               class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors">
                                                <i class="fas fa-edit mr-1"></i>編集
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
            `;
            
            document.getElementById('app').innerHTML = html;
        } catch (error) {
            console.error('Error loading devices:', error);
            document.getElementById('app').innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    データの読み込みに失敗しました。
                </div>
            `;
        }
    }

    // 機器詳細表示
    async loadDeviceDetail(deviceId) {
        try {
            const response = await axios.get(`${this.apiBase}/devices/${deviceId}`);
            const data = response.data;
            
            const html = `
                <div class="mb-6">
                    <div class="flex justify-between items-start mb-4">
                        <h2 class="text-2xl font-bold text-gray-800">
                            <i class="fas fa-info-circle mr-2"></i>${data.device.device_name}
                        </h2>
                        <div class="space-x-2">
                            <a href="/edit/${deviceId}" 
                               class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors">
                                <i class="fas fa-edit mr-2"></i>編集
                            </a>
                            <a href="/" 
                               class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors">
                                <i class="fas fa-arrow-left mr-2"></i>戻る
                            </a>
                        </div>
                    </div>

                    <!-- 基本情報 -->
                    <div class="bg-white rounded-lg shadow mb-6 p-6">
                        <h3 class="text-xl font-semibold mb-4 text-gray-800">
                            <i class="fas fa-clipboard-list mr-2"></i>基本情報
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><strong>機器名:</strong> ${data.device.device_name}</div>
                            <div><strong>型番:</strong> ${data.device.model_number}</div>
                            <div><strong>管理番号:</strong> ${data.device.management_number}</div>
                            <div><strong>取引業者:</strong> ${data.device.vendor_name}</div>
                            <div><strong>緊急電話:</strong> <a href="tel:${data.device.emergency_phone}" class="text-red-600 font-semibold">${data.device.emergency_phone}</a></div>
                            <div><strong>購入日:</strong> ${data.device.purchase_date}</div>
                        </div>
                        ${data.device.description ? `
                            <div class="mt-4">
                                <strong>説明:</strong>
                                <p class="mt-1 text-gray-700">${data.device.description}</p>
                            </div>
                        ` : ''}
                    </div>

                    <!-- 機器画像 -->
                    <div class="bg-white rounded-lg shadow mb-6">
                        <div class="p-6 border-b border-gray-200">
                            <div class="flex justify-between items-center">
                                <h3 class="text-xl font-semibold text-gray-800">
                                    <i class="fas fa-images mr-2"></i>機器画像
                                </h3>
                                <button onclick="app.showImageUploadForm(${deviceId})" 
                                        class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm transition-colors">
                                    <i class="fas fa-upload mr-1"></i>画像追加
                                </button>
                            </div>
                        </div>
                        <div class="p-6">
                            ${data.images.length === 0 ? 
                                '<p class="text-gray-500 text-center py-4">画像が登録されていません</p>' :
                                `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    ${data.images.map(image => `
                                        <div class="relative">
                                            <img src="${image.image_url}" alt="${image.caption || '機器画像'}" 
                                                 class="w-full h-48 object-cover rounded-lg shadow">
                                            <div class="absolute top-2 right-2">
                                                <button onclick="app.deleteImage(${image.id})" 
                                                        class="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full text-sm">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                            ${image.caption ? `
                                                <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
                                                    <p class="text-sm">${image.caption}</p>
                                                </div>
                                            ` : ''}
                                        </div>
                                    `).join('')}
                                </div>`
                            }
                        </div>
                    </div>

                    <!-- 消耗品価格表 -->
                    <div class="bg-white rounded-lg shadow mb-6">
                        <div class="p-6 border-b border-gray-200">
                            <div class="flex justify-between items-center">
                                <h3 class="text-xl font-semibold text-gray-800">
                                    <i class="fas fa-tags mr-2"></i>消耗品価格表
                                </h3>
                                <button onclick="app.showAddConsumableForm(${deviceId})" 
                                        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors">
                                    <i class="fas fa-plus mr-1"></i>消耗品追加
                                </button>
                            </div>
                        </div>
                        <div class="p-6">
                            ${data.consumables.length === 0 ? 
                                '<p class="text-gray-500 text-center py-4">消耗品が登録されていません</p>' :
                                `<div class="overflow-x-auto">
                                    <table class="min-w-full">
                                        <thead class="bg-gray-50">
                                            <tr>
                                                <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">消耗品名</th>
                                                <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">型番</th>
                                                <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">価格</th>
                                                <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">単位</th>
                                                <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">業者</th>
                                                <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-gray-200">
                                            ${data.consumables.map(consumable => `
                                                <tr class="hover:bg-gray-50">
                                                    <td class="px-4 py-3 text-sm text-gray-900">${consumable.consumable_name}</td>
                                                    <td class="px-4 py-3 text-sm text-gray-600">${consumable.part_number || '-'}</td>
                                                    <td class="px-4 py-3 text-sm text-gray-900">¥${Number(consumable.price).toLocaleString()}</td>
                                                    <td class="px-4 py-3 text-sm text-gray-600">${consumable.unit}</td>
                                                    <td class="px-4 py-3 text-sm text-gray-600">${consumable.vendor_name || '-'}</td>
                                                    <td class="px-4 py-3 text-sm">
                                                        <button onclick="app.deleteConsumable(${consumable.id})" 
                                                                class="text-red-600 hover:text-red-800 transition-colors">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>`
                            }
                        </div>
                    </div>
                </div>

                <!-- 画像アップロードフォーム（非表示） -->
                <div id="image-upload-form" class="hidden bg-white rounded-lg shadow p-6 mb-6">
                    <h4 class="text-lg font-semibold mb-4">画像アップロード</h4>
                    <form id="upload-image-form" enctype="multipart/form-data">
                        <div class="grid grid-cols-1 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">画像ファイル *</label>
                                <input type="file" name="image" accept="image/*" required
                                       class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">画像の種類</label>
                                <select name="image_type"
                                        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                                    <option value="main">メイン画像</option>
                                    <option value="manual">取扱説明書</option>
                                    <option value="parts">部品・付属品</option>
                                    <option value="other">その他</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">キャプション</label>
                                <input type="text" name="caption" placeholder="画像の説明（任意）"
                                       class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                            </div>
                        </div>
                        <div class="flex space-x-2 mt-4">
                            <button type="submit" 
                                    class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors">
                                <i class="fas fa-upload mr-1"></i>アップロード
                            </button>
                            <button type="button" onclick="app.hideImageUploadForm()" 
                                    class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors">
                                キャンセル
                            </button>
                        </div>
                    </form>
                </div>

                <!-- 消耗品追加フォーム（非表示） -->
                <div id="consumable-form" class="hidden bg-white rounded-lg shadow p-6 mb-6">
                    <h4 class="text-lg font-semibold mb-4">消耗品追加</h4>
                    <form id="add-consumable-form">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">消耗品名 *</label>
                                <input type="text" name="consumable_name" required
                                       class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">型番</label>
                                <input type="text" name="part_number"
                                       class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">価格 *</label>
                                <input type="number" name="price" step="0.01" required
                                       class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">単位</label>
                                <input type="text" name="unit" placeholder="個" value="個"
                                       class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">業者名</label>
                                <input type="text" name="vendor_name"
                                       class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                            </div>
                        </div>
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">備考</label>
                            <textarea name="notes" rows="2"
                                      class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"></textarea>
                        </div>
                        <div class="flex space-x-2 mt-4">
                            <button type="submit" 
                                    class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
                                <i class="fas fa-plus mr-1"></i>追加
                            </button>
                            <button type="button" onclick="app.hideConsumableForm()" 
                                    class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors">
                                キャンセル
                            </button>
                        </div>
                    </form>
                </div>
            `;
            
            document.getElementById('app').innerHTML = html;
            
            // 消耗品追加フォームのイベント設定
            const form = document.getElementById('add-consumable-form');
            if (form) {
                form.addEventListener('submit', (e) => this.handleAddConsumable(e, deviceId));
            }
            
            // 画像アップロードフォームのイベント設定
            const imageForm = document.getElementById('upload-image-form');
            if (imageForm) {
                imageForm.addEventListener('submit', (e) => this.handleImageUpload(e, deviceId));
            }
            
        } catch (error) {
            console.error('Error loading device detail:', error);
            document.getElementById('app').innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    機器の詳細情報の読み込みに失敗しました。
                </div>
            `;
        }
    }

    // 機器追加フォーム表示
    showAddDeviceForm() {
        const html = `
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">
                    <i class="fas fa-plus mr-2"></i>新しい医療機器の追加
                </h2>
                
                <form id="add-device-form">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">機器名 *</label>
                            <input type="text" name="device_name" required
                                   class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">型番 *</label>
                            <input type="text" name="model_number" required
                                   class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">管理番号 *</label>
                            <input type="text" name="management_number" required
                                   class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">取引業者 *</label>
                            <input type="text" name="vendor_name" required
                                   class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">緊急時電話番号 *</label>
                            <input type="tel" name="emergency_phone" required
                                   class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">購入年月日 *</label>
                            <input type="date" name="purchase_date" required
                                   class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                        </div>
                    </div>
                    
                    <div class="mt-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">説明</label>
                        <textarea name="description" rows="3"
                                  class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                  placeholder="機器の詳細説明やメモなど"></textarea>
                    </div>
                    
                    <div class="flex space-x-4 mt-8">
                        <button type="submit" 
                                class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded font-medium transition-colors">
                            <i class="fas fa-save mr-2"></i>保存
                        </button>
                        <a href="/" 
                           class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded font-medium transition-colors inline-block">
                            <i class="fas fa-times mr-2"></i>キャンセル
                        </a>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('app').innerHTML = html;
        
        // フォーム送信イベント設定
        document.getElementById('add-device-form').addEventListener('submit', this.handleAddDevice.bind(this));
    }

    // 機器編集フォーム表示
    async loadEditDeviceForm(deviceId) {
        try {
            const response = await axios.get(`${this.apiBase}/devices/${deviceId}`);
            const device = response.data.device;
            
            const html = `
                <div class="bg-white rounded-lg shadow p-6">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">
                        <i class="fas fa-edit mr-2"></i>医療機器の編集
                    </h2>
                    
                    <form id="edit-device-form" data-device-id="${deviceId}">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">機器名 *</label>
                                <input type="text" name="device_name" value="${device.device_name}" required
                                       class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">型番 *</label>
                                <input type="text" name="model_number" value="${device.model_number}" required
                                       class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">管理番号 *</label>
                                <input type="text" name="management_number" value="${device.management_number}" required
                                       class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">取引業者 *</label>
                                <input type="text" name="vendor_name" value="${device.vendor_name}" required
                                       class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">緊急時電話番号 *</label>
                                <input type="tel" name="emergency_phone" value="${device.emergency_phone}" required
                                       class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">購入年月日 *</label>
                                <input type="date" name="purchase_date" value="${device.purchase_date}" required
                                       class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                            </div>
                        </div>
                        
                        <div class="mt-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">説明</label>
                            <textarea name="description" rows="3"
                                      class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                      placeholder="機器の詳細説明やメモなど">${device.description || ''}</textarea>
                        </div>
                        
                        <div class="flex space-x-4 mt-8">
                            <button type="submit" 
                                    class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded font-medium transition-colors">
                                <i class="fas fa-save mr-2"></i>更新
                            </button>
                            <a href="/device/${deviceId}" 
                               class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded font-medium transition-colors inline-block">
                                <i class="fas fa-times mr-2"></i>キャンセル
                            </a>
                        </div>
                    </form>
                </div>
            `;
            
            document.getElementById('app').innerHTML = html;
            
            // フォーム送信イベント設定
            document.getElementById('edit-device-form').addEventListener('submit', this.handleEditDevice.bind(this));
            
        } catch (error) {
            console.error('Error loading edit form:', error);
            document.getElementById('app').innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    編集フォームの読み込みに失敗しました。
                </div>
            `;
        }
    }

    // 機器追加処理
    async handleAddDevice(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            await axios.post(`${this.apiBase}/devices`, data);
            alert('医療機器が正常に追加されました。');
            window.location.href = '/';
        } catch (error) {
            console.error('Error adding device:', error);
            alert('機器の追加に失敗しました。');
        }
    }

    // 機器編集処理
    async handleEditDevice(event) {
        event.preventDefault();
        
        const deviceId = event.target.dataset.deviceId;
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            await axios.put(`${this.apiBase}/devices/${deviceId}`, data);
            alert('医療機器が正常に更新されました。');
            window.location.href = `/device/${deviceId}`;
        } catch (error) {
            console.error('Error updating device:', error);
            alert('機器の更新に失敗しました。');
        }
    }

    // 消耗品追加フォーム表示
    showAddConsumableForm(deviceId) {
        const form = document.getElementById('consumable-form');
        if (form) {
            form.classList.remove('hidden');
        }
    }

    // 消耗品追加フォーム非表示
    hideConsumableForm() {
        const form = document.getElementById('consumable-form');
        if (form) {
            form.classList.add('hidden');
            form.querySelector('form').reset();
        }
    }

    // 消耗品追加処理
    async handleAddConsumable(event, deviceId) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            await axios.post(`${this.apiBase}/devices/${deviceId}/consumables`, data);
            alert('消耗品が正常に追加されました。');
            // ページをリロードして最新情報を表示
            this.loadDeviceDetail(deviceId);
        } catch (error) {
            console.error('Error adding consumable:', error);
            alert('消耗品の追加に失敗しました。');
        }
    }

    // 消耗品削除処理
    async deleteConsumable(consumableId) {
        if (!confirm('この消耗品を削除してもよろしいですか？')) {
            return;
        }
        
        try {
            await axios.delete(`${this.apiBase}/consumables/${consumableId}`);
            alert('消耗品が正常に削除されました。');
            // ページをリロード
            const deviceId = window.location.pathname.split('/')[2];
            this.loadDeviceDetail(deviceId);
        } catch (error) {
            console.error('Error deleting consumable:', error);
            alert('消耗品の削除に失敗しました。');
        }
    }

    // 画像アップロードフォーム表示
    showImageUploadForm(deviceId) {
        const form = document.getElementById('image-upload-form');
        if (form) {
            form.classList.remove('hidden');
        }
    }

    // 画像アップロードフォーム非表示
    hideImageUploadForm() {
        const form = document.getElementById('image-upload-form');
        if (form) {
            form.classList.add('hidden');
            form.querySelector('form').reset();
        }
    }

    // 画像アップロード処理
    async handleImageUpload(event, deviceId) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        
        try {
            await axios.post(`${this.apiBase}/devices/${deviceId}/images`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('画像が正常にアップロードされました。');
            // ページをリロードして最新情報を表示
            this.loadDeviceDetail(deviceId);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('画像のアップロードに失敗しました。');
        }
    }

    // 画像削除処理
    async deleteImage(imageId) {
        if (!confirm('この画像を削除してもよろしいですか？')) {
            return;
        }
        
        try {
            await axios.delete(`${this.apiBase}/images/${imageId}`);
            alert('画像が正常に削除されました。');
            // ページをリロード
            const deviceId = window.location.pathname.split('/')[2];
            this.loadDeviceDetail(deviceId);
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('画像の削除に失敗しました。');
        }
    }
}

// アプリケーション初期化
const app = new MedicalDeviceApp();