// script.js - 完整版（适用于你的库存管理系统）

// ==================== 控制台彩蛋字符艺术 ====================
// 大白话注释：这里是一些有趣的字符艺术，作为小彩蛋显示在浏览器控制台

// 字符艺术：CJH
function printCJHConsole() {
    console.log(`
    *********************************************************
    *                                                       *
    *    ███████╗██████╗  █████╗ ███╗   ███╗███████╗██████╗   *
    *    ██╔════╝██╔══██╗██╔══██╗████╗ ████║██╔════╝██╔══██╗  *
    *    █████╗  ██████╔╝███████║██╔████╔██║█████╗  ██████╔╝  *
    *    ██╔══╝  ██╔══██╗██╔══██║██║╚██╔╝██║██╔══╝  ██╔══██╗  *
    *    ███████╗██║  ██║██║  ██║██║ ╚═╝ ██║███████╗██║  ██║  *
    *    ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝  *
    *                                                       *
    *                   盘库系统开发者 CJH                  *
    *********************************************************
    `);
}

// 字符艺术：小兔子
function printLittleRabbitConsole() {
    console.log(`
    *********************************************************
    *                                                       *
    *                    ┌─┐  ┌─┐  ┌─┐                      *
    *                    │┌─┘  │┌─┘  │┌─┘                      *
    *                    ││    ││    ││                        *
    *                    │└─┐  │└─┐  │└─┐                      *
    *                    └─┘  └─┘  └─┘                      *
    *                                                       *
    *                    ╭─────╮                           *
    *                    │ ◉_◉ │      小兔子               *
    *                    ╰─────╯                           *
    *                                                       *
    *                    (\\(\\                              *
    *                    ( -.-)      欢迎使用盘库系统        *
    *                    O_(")(")                          *
    *********************************************************
    `);
}

// 字符艺术：盘库系统
function printInventorySystemConsole() {
    console.log(`
    ╔═══════════════════════════════════════════════════════╗
    ║                    盘库管理系统                       ║
    ║                                                       ║
    ║    ██████╗ ██╗   ██╗██████╗  ██████╗  ██████╗         ║
    ║    ██╔══██╗╚██╗ ██╔╝██╔══██╗██╔═══██╗██╔════╝         ║
    ║    ██████╔╝ ╚████╔╝ ██████╔╝██║   ██║██║  ███╗        ║
    ║    ██╔═══╝   ╚██╔╝  ██╔══██╗██║   ██║██║   ██║        ║
    ║    ██║        ██║   ██████╔╝╚██████╔╝╚██████╔╝        ║
    ║    ╚═╝        ╚═╝   ╚═════╝  ╚═════╝  ╚═════╝         ║
    ║                                                       ║
    ║              扫码盘点 | 数据导出 | 实时同步            ║
    ╚═══════════════════════════════════════════════════════╝
    `);
}

// 显示所有前端彩蛋字符艺术
function showFrontendEasterEggs() {
    console.log('='.repeat(60));
    printCJHConsole();
    printLittleRabbitConsole();
    printInventorySystemConsole();
    console.log('='.repeat(60));
    console.log('🎉 欢迎使用盘库管理系统！');
    console.log('💡 开发者：CJH');
    console.log('🐰 小兔子祝您使用愉快！');
    console.log('💬 微信：15127988973');
    console.log('='.repeat(60));
}

// 在页面加载完成后显示彩蛋
document.addEventListener('DOMContentLoaded', function() {
    showFrontendEasterEggs();
});

// 全局变量
let inventoryData = new Map(); // key: 条码, value: { stock: 当前库存量, name: 商品名称 }（内存中缓存）
let barcodeBuffer = '';        // 扫码枪输入缓冲区
let barcodeTimer = null;       // 扫码输入定时器
const SCAN_TIMEOUT = 300;      // 扫码枪输入间隔超时（毫秒）

let currentTask = null;        // 当前选中的任务对象
let tasks = [];                // 所有任务列表
let isTaskLocked = false;      // 任务锁定状态
let isTypesLocked = true;      // 商品类型管理锁定状态，默认锁定

// 商品名称映射（用于快速查找）
let productNames = new Map(); // key: 条码, value: 商品名称

// 日志自动刷新定时器
let logRefreshTimer = null;
const LOG_REFRESH_INTERVAL = 5000; // 日志自动刷新间隔（毫秒）

// API基础URL - 自动获取当前页面的协议和主机，确保外部设备可以正确访问
const currentUrl = new URL(window.location.href);
const API_BASE_URL = `${currentUrl.protocol}//${currentUrl.host}/api`;

// WebSocket相关
let ws = null;                 // WebSocket连接实例
let isWebSocketConnected = false; // WebSocket连接状态
let currentWebSocketTable = null; // 当前WebSocket订阅的任务表名

// WebSocket URL - 自动获取当前页面的协议和主机，转换为WebSocket协议
const WS_URL = `${currentUrl.protocol === 'https:' ? 'wss:' : 'ws:'}//${currentUrl.host}`;

// DOM 元素（提前缓存，提高性能）
const dom = {
    taskSelect: document.getElementById('taskSelect'),
    newTaskName: document.getElementById('newTaskName'),
    createTaskBtn: document.getElementById('createTaskBtn'),
    taskLockBtn: document.getElementById('taskLockBtn'),
    typesLockBtn: document.getElementById('typesLockBtn'),
    taskInfo: document.getElementById('taskInfo'),
    fileInput: document.getElementById('fileInput'),
    fileInfo: document.getElementById('fileInfo'),
    totalItems: document.getElementById('totalItems'),
    barcodeInput: document.getElementById('barcodeInput'),
    scanStatus: document.getElementById('scanStatus'),
    statusDot: document.querySelector('.status-dot'),
    lastScan: document.getElementById('lastScan'),
    inventoryBody: document.getElementById('inventoryBody'),
    deductionBody: document.getElementById('deductionBody'),
    logList: document.getElementById('logList'),
    typeSelectContainer: document.getElementById('typeSelectContainer'),
    typesList: document.getElementById('typesList'),
    exportDeductionBtn: document.getElementById('exportDeductionBtn'),
    exportUnscannedBtn: document.getElementById('exportUnscannedBtn')
};

// 商品类型数据
let productTypes = []; // 商品类型列表，每个元素包含 {id, type_name, default_deduction}
let availableProductTypes = new Set(); // 从Excel导入的所有可用商品类型

// ==================== 任务管理相关 ====================

// 获取所有任务列表
async function fetchTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        if (!response.ok) throw new Error('网络错误');
        tasks = await response.json();
        updateTaskSelect();
    } catch (error) {
        console.error('获取任务列表失败:', error);
        showNotification('获取任务列表失败', 'error');
    }
}

// 更新任务下拉选择框
function updateTaskSelect() {
    dom.taskSelect.innerHTML = '<option value="">-- 请选择任务 --</option>';
    tasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        option.textContent = `${task.task_name} (${new Date(task.created_at).toLocaleString()})`;
        dom.taskSelect.appendChild(option);
    });
}

// 创建新任务
async function createNewTask(taskName) {
    if (!taskName.trim()) {
        showNotification('任务名称不能为空', 'warning');
        return;
    }

    const timePrefix = new Date().toISOString().slice(0, 19).replace(/[:T-]/g, '');
    const tableName = `inventory_${timePrefix}_${taskName.replace(/[^a-zA-Z0-9]/g, '_')}`;

    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableName, taskName })
        });

        if (!response.ok) throw new Error('服务器响应错误');

        const newTask = await response.json();
        await fetchTasks();                    // 刷新任务列表
        dom.taskSelect.value = newTask.id;     // 自动选中新任务
        await selectTask(newTask.id);          // 加载新任务数据
        showNotification('任务创建成功！', 'success');
    } catch (error) {
        console.error('创建任务失败:', error);
        showNotification('创建任务失败', 'error');
    }
}

// 选择任务并加载数据
async function selectTask(taskId) {
    // 检查任务是否被锁定
    if (isTaskLocked && currentTask) {
        showNotification('任务已锁定，请先解锁再切换任务', 'warning');
        // 恢复原来的任务选择
        dom.taskSelect.value = currentTask.id;
        return;
    }
    
    // 停止之前的日志刷新定时器
    stopLogRefresh();
    
    // 取消之前的WebSocket订阅
    unsubscribeFromTask();
    
    const task = tasks.find(t => t.id === parseInt(taskId));
    if (!task) {
        currentTask = null;
        inventoryData.clear();
        updateInventoryTable();
        updateTotalItems();
        updateTaskInfo(null);
        dom.logList.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">请选择一个任务查看日志</p>';
        // 清空累计扣除表格
        dom.deductionBody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-secondary);padding:2rem;">暂无累计扣除记录</td></tr>';
        // 清空商品类型
        availableProductTypes.clear();
        productTypes = [];
        updateTypesList();
        updateTypeSelectContainer();
        // 解锁任务
        isTaskLocked = false;
        updateTaskLockUI();
        
        // 更新文件上传区域状态
        updateFileUploadAreaState();
        
        return;
    }

    currentTask = task;
    updateTaskInfo(task);
    
    // 自动锁定任务
    isTaskLocked = true;
    updateTaskLockUI();

    try {
        // 加载库存数据
        const invRes = await fetch(`${API_BASE_URL}/inventory/${task.table_name}`);
        if (!invRes.ok) throw new Error('加载库存失败');
        const invData = await invRes.json();

        inventoryData.clear();
        productNames.clear();
        availableProductTypes.clear(); // 清空可用商品类型集合
        invData.forEach(item => {
            inventoryData.set(item.barcode, { 
                stock: item.stock, 
                name: item.name || '未知商品',
                type: item.type || '未知类型' 
            });
            productNames.set(item.barcode, item.name || '未知商品');
            // 收集商品类型
            if (item.type && item.type !== '未知类型') {
                availableProductTypes.add(item.type);
            }
        });

        updateInventoryTable();
        updateTotalItems();

        // 加载日志
        await fetchLogs(task.table_name);
        
        // 加载商品类型列表
        await fetchProductTypes();
        
        // 更新商品类型选择容器
        updateTypeSelectContainer();
        
        // 启动日志自动刷新定时器
        startLogRefresh(task.table_name);
        
        // 订阅WebSocket消息
        subscribeToTask(task.table_name);

        // 更新文件上传区域状态
        updateFileUploadAreaState();

        showNotification(`已加载任务 "${task.task_name}" 并锁定`, 'success');
    } catch (error) {
        console.error('加载任务数据失败:', error);
        showNotification('加载任务数据失败', 'error');
    }
}

// 启动日志自动刷新定时器
function startLogRefresh(tableName) {
    // 确保只启动一个定时器
    stopLogRefresh();
    
    logRefreshTimer = setInterval(async () => {
        if (currentTask && currentTask.table_name === tableName) {
            await fetchLogs(tableName);
        } else {
            stopLogRefresh();
        }
    }, LOG_REFRESH_INTERVAL);
    
    console.log('日志自动刷新已启动，间隔', LOG_REFRESH_INTERVAL, '毫秒');
}

// 停止日志自动刷新定时器
function stopLogRefresh() {
    if (logRefreshTimer) {
        clearInterval(logRefreshTimer);
        logRefreshTimer = null;
        console.log('日志自动刷新已停止');
    }
}

// 更新任务锁定UI
function updateTaskLockUI() {
    if (!dom.taskLockBtn) return;
    
    const lockIcon = dom.taskLockBtn.querySelector('.lock-icon');
    if (isTaskLocked) {
        // 锁定状态
        lockIcon.textContent = '🔓'; // 显示解锁图标
        dom.taskLockBtn.title = '解锁任务';
        dom.taskLockBtn.classList.add('btn-lock-active');
        dom.taskSelect.disabled = true; // 禁用任务选择
    } else {
        // 解锁状态
        lockIcon.textContent = '🔒'; // 显示锁定图标
        dom.taskLockBtn.title = '锁定任务';
        dom.taskLockBtn.classList.remove('btn-lock-active');
        dom.taskSelect.disabled = false; // 启用任务选择
    }
}

// 切换任务锁定状态
function toggleTaskLock() {
    isTaskLocked = !isTaskLocked;
    updateTaskLockUI();
    
    if (isTaskLocked) {
        showNotification('任务已锁定，无法切换任务', 'success');
    } else {
        showNotification('任务已解锁，可以切换任务', 'info');
    }
}

// ==================== 商品类型管理相关 ====================

// 获取商品类型列表
async function fetchProductTypes() {
    if (!currentTask) {
        console.log('fetchProductTypes: 未选择任务，清空商品类型列表');
        productTypes = [];
        updateTypesList();
        updateTypeSelectContainer();
        return;
    }
    
    console.log('fetchProductTypes: 获取当前任务的商品类型列表，任务:', currentTask.task_name, '表名:', currentTask.table_name);
    
    try {
        const res = await fetch(`${API_BASE_URL}/types/${currentTask.table_name}`);
        if (!res.ok) {
            console.error('fetchProductTypes: 获取商品类型列表失败，状态码:', res.status);
            return;
        }
        productTypes = await res.json();
        console.log('fetchProductTypes: 成功获取商品类型列表:', JSON.stringify(productTypes));
        updateTypesList();
        updateTypeSelectContainer();
    } catch (err) {
        console.error('fetchProductTypes: 获取商品类型列表失败:', err);
        showNotification('获取商品类型列表失败', 'error');
    }
}

// 更新商品类型选择容器
function updateTypeSelectContainer() {
    if (!dom.typeSelectContainer) return;
    
    if (!currentTask) {
        dom.typeSelectContainer.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">请先选择一个任务，然后选择商品类型</p>';
        return;
    }
    
    // 检查是否有库存数据
    if (inventoryData.size === 0) {
        dom.typeSelectContainer.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">请先导入Excel文件获取商品类型</p>';
        return;
    }
    
    // 如果没有可用商品类型，尝试从库存数据中获取
    if (availableProductTypes.size === 0) {
        // 从库存数据中收集商品类型
        inventoryData.forEach(item => {
            if (item.type && item.type !== '未知类型') {
                availableProductTypes.add(item.type);
            }
        });
    }
    
    // 如果仍然没有可用商品类型，显示提示
    if (availableProductTypes.size === 0) {
        dom.typeSelectContainer.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">Excel文件中未包含商品类型信息</p>';
        return;
    }
    
    // 生成商品类型选择HTML
    const selectedTypeNames = new Set(productTypes.map(type => type.type_name));
    const typesHtml = Array.from(availableProductTypes).map(typeName => `
        <div class="type-checkbox-item">
            <input type="checkbox" id="type_${typeName}" value="${typeName}" 
                   ${selectedTypeNames.has(typeName) ? 'checked' : ''} 
                   onchange="toggleProductType('${typeName}')">
            <label for="type_${typeName}">${typeName}</label>
        </div>
    `).join('');
    
    dom.typeSelectContainer.innerHTML = typesHtml;
}

// 更新商品类型锁定UI
function updateTypesLockUI() {
    if (!dom.typesLockBtn) return;
    
    const lockIcon = dom.typesLockBtn.querySelector('.lock-icon');
    if (isTypesLocked) {
        // 锁定状态
        lockIcon.textContent = '🔓'; // 显示解锁图标
        dom.typesLockBtn.title = '解锁商品类型';
        dom.typesLockBtn.classList.add('btn-lock-active');
        // 禁用商品类型选择
        dom.typeSelectContainer.style.pointerEvents = 'none';
        dom.typeSelectContainer.style.opacity = '0.6';
        // 禁用所有删除按钮
        const deleteButtons = document.querySelectorAll('.type-actions .btn-danger');
        deleteButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.style.pointerEvents = 'none';
        });
    } else {
        // 解锁状态
        lockIcon.textContent = '🔒'; // 显示锁定图标
        dom.typesLockBtn.title = '锁定商品类型';
        dom.typesLockBtn.classList.remove('btn-lock-active');
        // 启用商品类型选择
        dom.typeSelectContainer.style.pointerEvents = 'auto';
        dom.typeSelectContainer.style.opacity = '1';
        // 启用所有删除按钮
        const deleteButtons = document.querySelectorAll('.type-actions .btn-danger');
        deleteButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        });
    }
}

// 切换商品类型锁定状态
function toggleTypesLock() {
    isTypesLocked = !isTypesLocked;
    updateTypesLockUI();
    
    if (isTypesLocked) {
        showNotification('商品类型已锁定，无法修改商品类型', 'success');
    } else {
        showNotification('商品类型已解锁，可以修改商品类型', 'info');
    }
}

// 切换商品类型（添加或删除）
async function toggleProductType(typeName) {
    if (!currentTask) {
        showNotification('请先选择一个任务', 'warning');
        return;
    }
    
    // 检查商品类型管理是否被锁定
    if (isTypesLocked) {
        showNotification('商品类型已锁定，无法修改商品类型', 'warning');
        return;
    }
    
    console.log('toggleProductType: 切换类型:', typeName, '当前任务:', currentTask.task_name);
    
    const isSelected = productTypes.some(type => type.type_name === typeName);
    
    console.log('toggleProductType: 当前是否已选择:', isSelected, '当前商品类型列表:', JSON.stringify(productTypes));
    
    if (isSelected) {
        // 删除商品类型
        const typeToDelete = productTypes.find(type => type.type_name === typeName);
        if (typeToDelete) {
            console.log('toggleProductType: 删除商品类型:', typeToDelete);
            await deleteProductType(typeToDelete.id);
        }
    } else {
        // 添加商品类型（默认扣除1个）
        console.log('toggleProductType: 添加商品类型:', typeName, '默认扣除数量:', 1);
        await addProductType(typeName, 1);
    }
}

// 添加商品类型
async function addProductType(typeName, deduction = 1) {
    if (!currentTask) {
        showNotification('请先选择一个任务', 'warning');
        return;
    }
    
    if (!typeName) {
        showNotification('请输入商品类型名称', 'warning');
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE_URL}/types/${currentTask.table_name}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                type_name: typeName, 
                default_deduction: deduction 
            })
        });
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `服务器返回错误: ${res.status}`);
        }
        
        const newType = await res.json();
        productTypes.push(newType);
        updateTypesList();
        updateTypeSelectContainer();
        
        showNotification(`商品类型 "${typeName}" 添加成功`, 'success');
    } catch (err) {
        console.error('添加商品类型失败:', err);
        showNotification(`添加商品类型失败: ${err.message}`, 'error');
    }
}

// 删除商品类型
async function deleteProductType(id) {
    if (!currentTask) {
        showNotification('请先选择一个任务', 'warning');
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE_URL}/types/${currentTask.table_name}/${id}`, {
            method: 'DELETE'
        });
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `服务器返回错误: ${res.status}`);
        }
        
        // 从列表中删除
        productTypes = productTypes.filter(type => type.id !== id);
        updateTypesList();
        updateTypeSelectContainer();
        
        showNotification('商品类型删除成功', 'success');
    } catch (err) {
        console.error('删除商品类型失败:', err);
        showNotification(`删除商品类型失败: ${err.message}`, 'error');
    }
}

// 更新商品类型列表显示
function updateTypesList() {
    if (!dom.typesList) return;
    
    if (!currentTask) {
        dom.typesList.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">请先选择一个任务，然后添加商品类型</p>';
        return;
    }
    
    if (productTypes.length === 0) {
        dom.typesList.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">暂无商品类型，请选择商品类型</p>';
        return;
    }
    
    // 生成商品类型列表HTML，根据锁定状态设置删除按钮的状态
    const typesHtml = productTypes.map(type => {
        // 根据锁定状态设置删除按钮的属性
        const deleteBtnDisabled = isTypesLocked ? 'disabled' : '';
        const deleteBtnStyle = isTypesLocked ? 'opacity: 0.6; pointer-events: none;' : '';
        
        return `
            <div class="type-item">
                <div class="type-info">
                    <div class="type-name">${type.type_name}</div>
                    <div class="type-deduction">默认扣除: ${type.default_deduction} 个</div>
                </div>
                <div class="type-actions">
                    <button class="btn btn-sm btn-danger" onclick="deleteProductType(${type.id})" ${deleteBtnDisabled} style="${deleteBtnStyle}">删除</button>
                </div>
            </div>
        `;
    }).join('');
    
    dom.typesList.innerHTML = typesHtml;
}

// 根据商品类型获取默认扣除数量
function getDefaultDeduction(typeName) {
    if (!typeName) {
        console.log('getDefaultDeduction: typeName为空');
        return 0;
    }
    
    console.log('getDefaultDeduction: 查找类型:', typeName, '当前商品类型列表:', JSON.stringify(productTypes));
    
    const productType = productTypes.find(type => type.type_name === typeName);
    const result = productType ? productType.default_deduction : 0;
    
    console.log('getDefaultDeduction: 结果:', result, '匹配的类型:', JSON.stringify(productType));
    
    return result;
}

// 显示扣除数量输入弹窗
function showDeductionPrompt(productName, currentStock) {
    return new Promise((resolve) => {
        // 创建弹窗容器
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>输入扣除数量</h3>
                    <button class="close-btn" id="closePromptBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <p>商品：${productName}</p>
                    <p>当前库存：${currentStock}</p>
                    <div class="deduction-input-container" style="margin-top: 1rem;">
                        <label for="deductionAmount" style="display: block; margin-bottom: 0.5rem;">扣除数量：</label>
                        <input type="number" id="deductionAmount" min="1" max="${currentStock}" value="1" style="padding: 0.75rem; width: 100%; font-size: 1.25rem; text-align: center; border: 2px solid #ddd; border-radius: 0.5rem;">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="confirmBtn">确认</button>
                    <button class="btn btn-secondary" id="cancelBtn">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 获取弹窗元素
        const deductionInput = modal.querySelector('#deductionAmount');
        const confirmBtn = modal.querySelector('#confirmBtn');
        const cancelBtn = modal.querySelector('#cancelBtn');
        const closeBtn = modal.querySelector('#closePromptBtn');
        
        // 自动聚焦到输入框
        deductionInput.focus();
        deductionInput.select();
        
        // 确认按钮事件
        confirmBtn.addEventListener('click', () => {
            const value = parseInt(deductionInput.value) || 1;
            document.body.removeChild(modal);
            resolve(value);
        });
        
        // 取消按钮事件
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(null);
        });
        
        // 关闭按钮事件
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(null);
        });
        
        // 回车确认
        deductionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const value = parseInt(deductionInput.value) || 1;
                document.body.removeChild(modal);
                resolve(value);
            }
        });
        
        // ESC取消
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                resolve(null);
            }
        });
        
        // 点击模态框背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                resolve(null);
            }
        });
    });
}

// 更新任务信息显示
function updateTaskInfo(task) {
    if (!task) {
        dom.taskInfo.innerHTML = '<p>请选择一个任务开始工作</p>';
        return;
    }
    dom.taskInfo.innerHTML = `
        <p><strong>当前任务:</strong> ${task.task_name}</p>
        <p><strong>创建时间:</strong> ${new Date(task.created_at).toLocaleString()}</p>
        <p><strong>更新时间:</strong> ${new Date(task.updated_at).toLocaleString()}</p>
    `;
}

// ==================== Excel 导入相关 ====================

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查当前任务是否已经有库存数据
    if (currentTask && inventoryData.size > 0) {
        showNotification('当前任务已经有库存数据，不允许重复导入Excel', 'warning');
        dom.fileInfo.textContent = '当前任务已经有库存数据，不允许重复导入Excel';
        dom.fileInput.value = ''; // 清空文件选择
        return;
    }

    dom.fileInfo.textContent = `已选择文件: ${file.name}`;

    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            if (jsonData.length === 0) {
                showNotification('Excel 文件为空', 'warning');
                return;
            }

            // 数据清洗 + 合并相同条码
            const mergedMap = new Map();
            const nameMap = new Map(); // 存储商品名称映射
            const originalCount = jsonData.length;
            const typeSet = new Set(); // 临时存储所有商品类型
            
            jsonData.forEach(row => {
                // 支持多种条码列名：条码、barcode、商品条码
                let barcode = String(row['条码'] || row['barcode'] || row['商品条码'] || '').trim();
                if (barcode) {
                    // 保存原始条码用于调试
                    const originalBarcode = barcode;
                    
                    // 条码清洗：只保留数字字符
                    barcode = barcode.replace(/[^0-9]/g, '');
                    if (!barcode) return; // 如果清洗后条码为空，则跳过
                    
                    // 支持多种库存列名：库存量、stock、数量、库存数量
                    const stock = parseInt(row['库存量'] || row['stock'] || row['数量'] || row['库存数量'] || 0) || 0;
                    
                    // 支持多种商品名称列名：商品名称、名称、商品名
                    const name = String(row['商品名称'] || row['name'] || row['名称'] || row['商品名'] || '').trim() || '未知商品';
                    
                    // 支持多种商品类型列名：商品类型、type、类型
                    const type = String(row['商品类型'] || row['type'] || row['类型'] || '').trim() || '未知类型';
                    
                    // 收集商品类型
                    if (type && type !== '未知类型') {
                        typeSet.add(type);
                    }
                    
                    // 更新库存数量
                    const currentItem = mergedMap.get(barcode) || { stock: 0, name: '未知商品', type: '未知类型' };
                    mergedMap.set(barcode, {
                        stock: currentItem.stock + stock,
                        name: currentItem.name === '未知商品' ? name : currentItem.name,
                        type: currentItem.type === '未知类型' ? type : currentItem.type
                    });
                    
                    // 保存商品名称和类型（如果条码不存在或已有名称为空）
                    if (!nameMap.has(barcode) || nameMap.get(barcode).name === '未知商品') {
                        nameMap.set(barcode, { name, type });
                    }
                    
                    // 调试：如果是相同条码合并，输出日志
                    if (currentItem.stock > 0) {
                        console.log(`合并条码: ${originalBarcode} -> ${barcode}, 库存: ${currentItem.stock} + ${stock} = ${currentItem.stock + stock}`);
                    }
                }
            });
            
            // 更新可用商品类型集合
            availableProductTypes = typeSet;
            
            // 输出合并结果统计
            console.log(`条码合并完成: ${originalCount} 行原始数据 -> ${mergedMap.size} 个唯一商品`);
            
            // 更新内存
            inventoryData.clear();
            productNames.clear();
            const importItems = [];
            mergedMap.forEach((item, barcode) => {
                const name = item.name || '未知商品';
                const type = item.type || '未知类型';
                const stock = item.stock;
                
                inventoryData.set(barcode, { stock, name, type });
                productNames.set(barcode, { name, type });
                importItems.push({ barcode, name, stock, type });
            });

            updateInventoryTable();
            updateTotalItems();

            // 如果已选择任务，则同步到服务器
            if (currentTask) {
                try {
                    const response = await fetch(`${API_BASE_URL}/inventory/${currentTask.table_name}/import`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(importItems)
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || `服务器返回错误: ${response.status}`);
                    }
                    
                    const result = await response.json();
                    console.log('服务器导入结果:', result);
                    showNotification(`成功导入 ${result.count || importItems.length} 个唯一商品（原始 ${jsonData.length} 行）到服务器`, 'success');
                } catch (err) {
                    console.error('同步到服务器失败:', err);
                    showNotification(`数据导入成功，但同步到服务器失败: ${err.message}`, 'warning');
                }
            } else {
                showNotification(`成功导入 ${importItems.length} 个唯一商品（原始 ${jsonData.length} 行）到本地`, 'success');
            }
            
            // 更新商品类型选择容器
            updateTypeSelectContainer();
        } catch (err) {
            console.error('Excel解析失败:', err);
            showNotification('文件解析失败，请检查格式', 'error');
        }
    };
    reader.readAsArrayBuffer(file);
}

// ==================== 文件上传状态管理 ====================

// 更新文件上传区域状态
function updateFileUploadAreaState() {
    if (!currentTask) {
        // 没有选择任务时，允许上传
        dom.fileInfo.textContent = '';
        dom.fileInput.disabled = false;
        return;
    }
    
    if (inventoryData.size > 0) {
        // 当前任务已经有库存数据，禁用上传
        dom.fileInfo.textContent = '当前任务已经有库存数据，不允许重复导入Excel';
        dom.fileInput.disabled = true;
    } else {
        // 当前任务没有库存数据，允许上传
        dom.fileInfo.textContent = '';
        dom.fileInput.disabled = false;
    }
}

// ==================== WebSocket相关函数 ====================

// 建立WebSocket连接
function connectWebSocket() {
    console.log('connectWebSocket: 正在连接WebSocket服务器:', WS_URL);
    
    // 关闭现有的WebSocket连接
    if (ws) {
        ws.close();
    }
    
    // 创建新的WebSocket连接
    ws = new WebSocket(WS_URL);
    
    // 连接打开事件
    ws.onopen = () => {
        console.log('WebSocket: 连接已打开');
        isWebSocketConnected = true;
        
        // 如果当前有选中的任务，自动订阅
        if (currentTask) {
            subscribeToTask(currentTask.table_name);
        }
    };
    
    // 收到消息事件
    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('WebSocket: 收到消息:', data);
            
            // 处理日志更新消息
            if (data.action === 'log_update') {
                handleLogUpdate(data);
            } else if (data.action === 'subscribed') {
                console.log('WebSocket: 成功订阅任务:', data.tableName);
            }
        } catch (error) {
            console.error('WebSocket: 消息解析失败:', error);
        }
    };
    
    // 连接关闭事件
    ws.onclose = () => {
        console.log('WebSocket: 连接已关闭');
        isWebSocketConnected = false;
    };
    
    // 连接错误事件
    ws.onerror = (error) => {
        console.error('WebSocket: 连接错误:', error);
        isWebSocketConnected = false;
    };
}

// 关闭WebSocket连接
function closeWebSocket() {
    if (ws) {
        ws.close();
        ws = null;
        isWebSocketConnected = false;
        currentWebSocketTable = null;
        console.log('WebSocket: 连接已手动关闭');
    }
}

// 发送WebSocket消息
function sendWebSocketMessage(message) {
    if (ws && isWebSocketConnected && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
        console.log('WebSocket: 发送消息:', message);
        return true;
    } else {
        console.error('WebSocket: 无法发送消息，连接未建立');
        return false;
    }
}

// 订阅任务的WebSocket消息
function subscribeToTask(tableName) {
    if (!tableName) return;
    
    // 如果已经订阅了该任务，不需要重复订阅
    if (currentWebSocketTable === tableName) {
        console.log('WebSocket: 已经订阅了任务:', tableName);
        return;
    }
    
    // 取消之前的订阅
    unsubscribeFromTask();
    
    // 发送订阅请求
    const success = sendWebSocketMessage({
        action: 'subscribe',
        tableName: tableName
    });
    
    if (success) {
        currentWebSocketTable = tableName;
        console.log('WebSocket: 已请求订阅任务:', tableName);
    }
}

// 取消订阅任务的WebSocket消息
function unsubscribeFromTask() {
    currentWebSocketTable = null;
    console.log('WebSocket: 已取消订阅当前任务');
}

// 处理日志更新消息
function handleLogUpdate(data) {
    if (!data.log) return;
    
    const log = data.log;
    console.log('handleLogUpdate: 处理日志更新:', log);
    
    // 调用addLogEntry函数添加日志条目
    addLogEntry(
        log.barcode, 
        log.action, 
        log.old_stock, 
        log.new_stock, 
        'success',
        log.created_at, // 使用服务器返回的时间戳
        log.ip_address // 使用服务器返回的IP地址
    );
    
    // 更新累计扣除统计
    // 重新获取所有日志来更新累计扣除，确保准确性
    if (currentTask) {
        fetchLogs(currentTask.table_name).catch(err => {
            console.error('handleLogUpdate: 更新累计扣除失败:', err);
        });
    }
}

// ==================== 公共函数 ====================

// 从服务器加载所有库存数据到内存
async function loadAllInventoryData() {
    if (!currentTask) return;
    
    console.log('loadAllInventoryData: 从服务器加载所有库存数据');
    
    try {
        const invRes = await fetch(`${API_BASE_URL}/inventory/${currentTask.table_name}`);
        if (!invRes.ok) throw new Error('加载库存失败');
        const invData = await invRes.json();

        // 更新内存中的库存数据
        inventoryData.clear();
        productNames.clear();
        invData.forEach(item => {
            inventoryData.set(item.barcode, { 
                stock: item.stock, 
                name: item.name || '未知商品',
                type: item.type || '未知类型' 
            });
            productNames.set(item.barcode, { 
                name: item.name || '未知商品',
                type: item.type || '未知类型' 
            });
        });

        // 更新UI
        updateInventoryTable();
        updateTotalItems();
        
        return invData;
    } catch (err) {
        console.error('loadAllInventoryData: 加载库存数据失败:', err);
        throw err;
    }
}

// 从服务器获取单个商品的最新库存数据
async function getLatestStockFromServer(barcode) {
    if (!currentTask) return null;
    
    console.log('getLatestStockFromServer: 获取条码', barcode, '的最新库存数据');
    
    try {
        // 尝试使用单个条码API获取
        const barcodeRes = await fetch(`${API_BASE_URL}/inventory/${currentTask.table_name}/barcode/${barcode}`);
        
        if (barcodeRes.ok) {
            return await barcodeRes.json();
        } else if (barcodeRes.status === 404) {
            // 如果商品不存在，返回null
            return null;
        } else {
            // 如果获取失败，尝试使用批量获取的方式作为后备
            console.log('getLatestStockFromServer: 单个条码API失败，尝试使用批量获取');
            const invData = await loadAllInventoryData();
            return invData.find(item => item.barcode === barcode) || null;
        }
    } catch (err) {
        console.error('getLatestStockFromServer: 获取最新库存失败:', err);
        throw err;
    }
}

// 更新单个商品的库存数据到服务器
async function updateStockOnServer(barcode, newStock) {
    if (!currentTask) return null;
    
    console.log('updateStockOnServer: 更新条码', barcode, '的库存数据到服务器，新库存:', newStock);
    
    try {
        const response = await fetch(`${API_BASE_URL}/inventory/${currentTask.table_name}/${barcode}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock: newStock })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `服务器返回错误: ${response.status}`);
        }
        
        return await response.json();
    } catch (err) {
        console.error('updateStockOnServer: 更新库存到服务器失败:', err);
        throw err;
    }
}

// 更新内存中的库存数据并刷新UI
function updateStockInMemory(barcode, newStock, productName, type) {
    console.log('updateStockInMemory: 更新条码', barcode, '的内存数据，新库存:', newStock, '商品名称:', productName, '类型:', type);
    
    // 保留原有的商品类型信息
    const originalItem = inventoryData.get(barcode);
    inventoryData.set(barcode, { 
        stock: newStock, 
        name: productName, 
        type: type || originalItem?.type || '未知类型' 
    });
    
    // 更新 UI
    updateInventoryTable();
    updateTotalItems();
}

// ==================== 扫码扣库存相关 ====================

// 全局键盘监听（支持扫码枪直接扫描，无需焦点）
document.addEventListener('keydown', function (e) {
    // 如果正在编辑输入框，则不拦截
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    // 完全忽略回车键，不添加到缓冲区，也不触发任何操作
    if (e.key === 'Enter') {
        e.preventDefault();
        // 不要返回，继续处理，因为扫码枪可能会发送回车键作为结束符
        // 但是我们不希望它影响我们的处理逻辑
        return;
    }

    // 只处理单个字符（扫码枪特征）
    if (e.key.length === 1) {
        barcodeBuffer += e.key;

        clearTimeout(barcodeTimer);
        barcodeTimer = setTimeout(async () => {
            if (barcodeBuffer) {
                await processBarcode(barcodeBuffer.trim());
                barcodeBuffer = '';
            }
        }, SCAN_TIMEOUT);
    }
});

// 处理扫码扣库存
async function processBarcode(barcode) {
    // 条码清洗：只保留数字字符
    barcode = barcode.replace(/[^0-9]/g, '');
    dom.barcodeInput.value = barcode; // 可视化反馈

    // 确保在所有情况下都清空条形码输入框
    try {
        if (!currentTask) {
            showNotification('请先选择一个任务', 'warning');
            updateLastScan('未选择任务', 'error');
            addLogEntry(barcode, '未找到条码', 0, 0, 'error');
            return;
        }

        // 1. 扫码后，先从服务器获取最新库存数据
        showNotification('正在获取最新库存...', 'info');
        
        // 1.1 先获取商品基本信息
        if (!inventoryData.has(barcode)) {
            // 如果内存中没有该商品，先从服务器加载所有库存数据
            await loadAllInventoryData();
        }
        
        // 1.2 然后专门获取当前条码的最新库存（防止上面的批量加载后又有其他设备修改了该商品库存）
        const currentItem = inventoryData.get(barcode);
        if (!currentItem) {
            showNotification(`未找到条码: ${barcode}`, 'error');
            updateLastScan(`未找到条码: ${barcode}`, 'error');
            addLogEntry(barcode, '未找到条码', 0, 0, 'error');
            return;
        }
        
        // 2. 获取最新库存数量
        const productName = currentItem.name;
        
        // 2.1 使用新的API端点，从服务器获取该条码的最新库存（避免获取所有库存数据）
        const latestItem = await getLatestStockFromServer(barcode);
        
        if (!latestItem) {
            // 如果商品不存在，使用内存中的数据
            showNotification(`商品 ${productName} 不存在于数据库中`, 'warning');
            return;
        }
        
        const oldStock = latestItem.stock;
        
        // 3. 检查库存是否充足
        if (oldStock <= 0) {
            showNotification(`库存不足: ${productName} (${barcode})`, 'warning');
            updateLastScan('库存不足', 'error');
            addLogEntry(barcode, '库存不足', oldStock, oldStock, 'error');
            return;
        }
        
        // 4. 根据商品类型计算扣除数量
        let deduction = 1; // 默认扣除1个
        
        // 从库存数据中获取商品类型
        const productType = inventoryData.get(barcode)?.type || '未知类型';
        
        // 从服务器获取最新的商品类型数据，确保数据是最新的
        await fetchProductTypes();
        
        // 检查是否是自定义类型
        const defaultDeduction = getDefaultDeduction(productType);
        if (defaultDeduction > 0) {
            // 是自定义类型，使用默认扣除数量
            deduction = defaultDeduction;
            console.log(`使用默认扣除数量: ${deduction} 个，商品类型: ${productType}`);
        } else {
            // 是其他类型，需要用户手动输入扣除数量
            deduction = await showDeductionPrompt(productName, oldStock);
            if (deduction === null || isNaN(deduction) || deduction < 1) {
                showNotification('请输入有效的扣除数量', 'warning');
                updateLastScan('无效的扣除数量', 'error');
                return;
            }
            console.log(`手动输入扣除数量: ${deduction} 个，商品类型: ${productType}`);
        }
        
        // 5. 检查扣除后的库存是否充足
        const newStock = oldStock - deduction;
        if (newStock < 0) {
            showNotification(`库存不足: ${productName} (${barcode})`, 'warning');
            updateLastScan('库存不足', 'error');
            addLogEntry(barcode, '库存不足', oldStock, oldStock, 'error');
            return;
        }
        
        // 6. 更新内存中的库存数据
        updateStockInMemory(barcode, newStock, productName, currentItem.type);

        // 7. 同步到服务器
        const result = await updateStockOnServer(barcode, newStock);
        console.log('服务器更新结果:', result);
        
        // 8. 同步成功后，刷新日志
        await fetchLogs(currentTask.table_name);

        // 9. 成功反馈
        showNotification(`扣除成功，${productName} 剩余 ${newStock}`, 'success');
        updateLastScan(`成功扣除: ${productName}`, 'success');

        // 10. 状态灯效果
        dom.statusDot.classList.add('scanned');
        dom.scanStatus.querySelector('span:last-child').textContent = '已识别条码';
        setTimeout(() => {
            dom.statusDot.classList.remove('scanned');
            dom.scanStatus.querySelector('span:last-child').textContent = '等待扫码';
        }, 3000);
        
    } catch (err) {
        console.error('处理扫码失败:', err);
        showNotification(`处理扫码失败: ${err.message}`, 'error');
        updateLastScan(`处理失败: ${err.message}`, 'error');
    } finally {
        // 无论扫码是否成功，都清空条形码输入框
        setTimeout(() => {
            dom.barcodeInput.value = '';
        }, 500); // 延迟500毫秒，让用户能看到扫码结果
    }
}

// ==================== 日志相关 ====================

function addLogEntry(barcode, action, oldStock, newStock, type = 'success', timestamp = null, ipAddress = 'unknown') {
    // 获取商品名称
    const productName = productNames.get(barcode) || inventoryData.get(barcode)?.name || '未知商品';
    
    // 使用自定义时间戳或当前时间
    const logDate = timestamp ? new Date(timestamp) : new Date();
    
    // 格式化时间，确保包含秒数
    const formattedTime = logDate.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const item = document.createElement('div');
    item.className = `log-item ${type}`;
    item.innerHTML = `
        <div class="log-content">
            <strong>${productName}</strong> (${barcode}) - ${action}<br>
            <small>库存变化: ${oldStock} → ${newStock} | IP: ${ipAddress}</small>
        </div>
        <div class="log-time">${formattedTime}</div>
    `;
    dom.logList.insertBefore(item, dom.logList.firstChild);

    // 限制最多100条日志
    while (dom.logList.children.length > 100) {
        dom.logList.removeChild(dom.logList.lastChild);
    }
}

async function fetchLogs(tableName) {
    try {
        const res = await fetch(`${API_BASE_URL}/logs/${tableName}`);
        if (!res.ok) {
            console.error('获取日志失败，状态码:', res.status);
            return;
        }
        const logs = await res.json();
        
        // 清空现有日志，使用服务器返回的完整日志
        dom.logList.innerHTML = '';
        
        // 服务器返回的日志是按照created_at降序排列的，我们需要反转顺序，确保最新的日志显示在最上方
        // 因为addLogEntry会将每个日志插入到列表的最前面
        const reversedLogs = [...logs].reverse();
        
        // 遍历反转后的日志，使用服务器提供的时间戳和IP地址
        reversedLogs.forEach(log => {
            addLogEntry(
                log.barcode, 
                log.action, 
                log.old_stock, 
                log.new_stock, 
                'success',
                log.created_at, // 使用服务器返回的时间戳
                log.ip_address // 使用服务器返回的IP地址
            );
        });
        
        // 更新累计扣除数量
        updateDeductionStats(logs);
    } catch (err) {
        console.error('加载日志失败:', err);
        showNotification('加载日志失败，请刷新页面重试', 'error');
    }
}

// 计算并更新累计扣除统计
function updateDeductionStats(logs) {
    // 清空现有累计扣除表格
    dom.deductionBody.innerHTML = '';
    
    // 使用Map来存储每个条码的累计扣除数量
    const deductionMap = new Map();
    
    // 遍历日志，计算累计扣除数量
    logs.forEach(log => {
        if (log.action === '扣除库存') {
            // 计算本次扣除的数量：old_stock - new_stock
            const deductionAmount = log.old_stock - log.new_stock;
            // 更新累计扣除数量
            deductionMap.set(
                log.barcode, 
                (deductionMap.get(log.barcode) || 0) + deductionAmount
            );
        }
    });
    
    // 如果没有扣除记录
    if (deductionMap.size === 0) {
        dom.deductionBody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-secondary);padding:2rem;">暂无累计扣除记录</td></tr>';
        return;
    }
    
    // 将Map转换为数组，并按条码排序
    const sortedDeductions = Array.from(deductionMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    
    // 更新累计扣除表格
    sortedDeductions.forEach(([barcode, totalDeduction]) => {
        // 获取商品名称
        const productName = productNames.get(barcode) || inventoryData.get(barcode)?.name || '未知商品';
        
        // 创建表格行
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${barcode}</td>
            <td>${productName}</td>
            <td>${totalDeduction}</td>
        `;
        dom.deductionBody.appendChild(tr);
    });
}

// 导出完整日志记录为XLSX文件（包含商品名称和分类列）
async function exportDeductionRecords() {
    // 检查当前是否有任务
    if (!currentTask) {
        showNotification('请先选择一个任务', 'warning');
        return;
    }
    
    try {
        // 显示导出提示
        showNotification('正在生成导出文件...', 'info');
        
        // 从服务器获取完整的日志数据
        const response = await fetch(`${API_BASE_URL}/logs/${currentTask.table_name}`);
        if (!response.ok) throw new Error('获取日志数据失败');
        const logs = await response.json();
        
        // 如果没有日志记录
        if (logs.length === 0) {
            showNotification('当前没有日志记录可导出', 'warning');
            return;
        }
        
        // 创建工作簿和工作表
        const wb = XLSX.utils.book_new();
        const wsData = [
            ['ID', '条码', '商品名称', '分类', '操作', '原库存', '新库存', '时间', 'IP地址']
        ];
        
        // 添加数据行
        logs.forEach(log => {
            // 从库存数据中获取商品名称和分类
            const productInfo = inventoryData.get(log.barcode);
            const productName = productInfo?.name || productNames.get(log.barcode) || '未知商品';
            const productType = productInfo?.type || '未知分类';
            
            wsData.push([
                log.id,
                log.barcode,
                productName,
                productType,
                log.action,
                log.old_stock,
                log.new_stock,
                log.created_at,
                log.ip_address
            ]);
        });
        
        // 创建工作表
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // 设置列宽
        const colWidths = [
            {wch: 8},  // ID列宽
            {wch: 20}, // 条码列宽
            {wch: 30}, // 商品名称列宽
            {wch: 15}, // 分类列宽
            {wch: 12}, // 操作列宽
            {wch: 10}, // 原库存列宽
            {wch: 10}, // 新库存列宽
            {wch: 20}, // 时间列宽
            {wch: 15}  // IP地址列宽
        ];
        ws['!cols'] = colWidths;
        
        // 将工作表添加到工作簿
        XLSX.utils.book_append_sheet(wb, ws, '日志记录');
        
        // 生成文件名（包含任务名称和当前时间）
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T-]/g, '');
        const filename = `${currentTask.task_name}_完整日志_${timestamp}.xlsx`;
        
        // 导出文件
        XLSX.writeFile(wb, filename);
        
        showNotification(`完整日志已导出: ${filename}`, 'success');
    } catch (error) {
        console.error('导出完整日志失败:', error);
        showNotification('导出完整日志失败: ' + error.message, 'error');
    }
}

// 导出未被盘点的产品为XLSX文件
async function exportUnscannedProducts() {
    // 检查当前是否有任务
    if (!currentTask) {
        showNotification('请先选择一个任务', 'warning');
        return;
    }
    
    try {
        // 显示导出提示
        showNotification('正在生成未盘点产品列表...', 'info');
        
        // 从服务器获取完整的日志数据
        const response = await fetch(`${API_BASE_URL}/logs/${currentTask.table_name}`);
        if (!response.ok) throw new Error('获取日志数据失败');
        const logs = await response.json();
        
        // 获取所有已扫描的条码（从日志中提取）
        const scannedBarcodes = new Set();
        logs.forEach(log => {
            scannedBarcodes.add(log.barcode);
        });
        
        // 获取库存中所有未扫描的产品（在库存中但不在日志中的产品）
        const unscannedProducts = [];
        for (const [barcode, item] of inventoryData) {
            if (!scannedBarcodes.has(barcode)) {
                unscannedProducts.push({
                    barcode: barcode,
                    name: item.name,
                    type: item.type,
                    stock: item.stock
                });
            }
        }
        
        // 如果没有未扫描的产品
        if (unscannedProducts.length === 0) {
            showNotification('所有产品都已被盘点', 'info');
            return;
        }
        
        // 创建工作簿和工作表
        const wb = XLSX.utils.book_new();
        const wsData = [
            ['条码', '商品名称', '分类', '当前库存']
        ];
        
        // 添加数据行
        unscannedProducts.forEach(product => {
            wsData.push([
                product.barcode,
                product.name,
                product.type,
                product.stock
            ]);
        });
        
        // 创建工作表
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // 设置列宽
        const colWidths = [
            {wch: 20}, // 条码列宽
            {wch: 30}, // 商品名称列宽
            {wch: 15}, // 分类列宽
            {wch: 10}  // 当前库存列宽
        ];
        ws['!cols'] = colWidths;
        
        // 将工作表添加到工作簿
        XLSX.utils.book_append_sheet(wb, ws, '未盘点产品');
        
        // 生成文件名（包含任务名称和当前时间）
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T-]/g, '');
        const filename = `${currentTask.task_name}_未盘点产品_${timestamp}.xlsx`;
        
        // 导出文件
        XLSX.writeFile(wb, filename);
        
        showNotification(`未盘点产品已导出: ${filename}`, 'success');
    } catch (error) {
        console.error('导出未盘点产品失败:', error);
        showNotification('导出未盘点产品失败: ' + error.message, 'error');
    }
}

// ==================== UI 辅助函数 ====================

function updateTotalItems() {
    dom.totalItems.textContent = inventoryData.size;
}

function updateInventoryTable() {
    dom.inventoryBody.innerHTML = '';
    if (inventoryData.size === 0) {
        dom.inventoryBody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-secondary);padding:2rem;">暂无库存数据</td></tr>';
        return;
    }

    const sorted = Array.from(inventoryData.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    sorted.forEach(([barcode, item]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${barcode}</td><td>${item.name}</td><td>${item.stock}</td>`;
        dom.inventoryBody.appendChild(tr);
    });
}

function updateLastScan(msg, type) {
    dom.lastScan.textContent = `上次扫码: ${msg}`;
    dom.lastScan.className = `last-scan ${type}`;
}

function showNotification(msg, type = 'success') {
    // 移除所有现有的通知，确保新消息进来旧的直接消失
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(noti => {
        noti.remove();
    });
    
    const noti = document.createElement('div');
    noti.className = `notification ${type}`;
    noti.textContent = msg;
    document.body.appendChild(noti);

    setTimeout(() => {
        noti.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => noti.remove(), 300);
    }, 3000);
}

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', async () => {
    await fetchTasks(); // 页面加载先获取任务列表

    // 建立WebSocket连接
    connectWebSocket();

    // 绑定事件
    dom.fileInput.addEventListener('change', handleFileUpload);
    dom.taskSelect.addEventListener('change', e => selectTask(e.target.value));
    dom.createTaskBtn.addEventListener('click', () => {
        const name = dom.newTaskName.value.trim();
        if (name) {
            createNewTask(name);
            dom.newTaskName.value = '';
        } else {
            showNotification('请输入任务名称', 'warning');
        }
    });

    dom.newTaskName.addEventListener('keypress', e => {
        if (e.key === 'Enter') dom.createTaskBtn.click();
    });
    
    // 添加任务锁定按钮事件监听
    dom.taskLockBtn.addEventListener('click', toggleTaskLock);
    
    // 添加商品类型锁定按钮事件监听
    dom.typesLockBtn.addEventListener('click', toggleTypesLock);

    // 添加导出累计扣除记录按钮事件监听
    if (dom.exportDeductionBtn) {
        dom.exportDeductionBtn.addEventListener('click', exportDeductionRecords);
    }

    // 添加导出未盘点产品按钮事件监听
    if (dom.exportUnscannedBtn) {
        dom.exportUnscannedBtn.addEventListener('click', exportUnscannedProducts);
    }

    // 输入框获得焦点（方便手动输入测试）
    dom.barcodeInput.focus();
    
    // 初始化UI
    updateTaskLockUI();
    updateTypesLockUI();
    
    // 初始化商品类型列表和选择容器
    updateTypesList();
    updateTypeSelectContainer();
});