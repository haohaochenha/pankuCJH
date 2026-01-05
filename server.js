const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const os = require('os');
const qrcode = require('qrcode');

// ==================== 控制台彩蛋字符艺术 ====================
// 大白话注释：这里是一些有趣的字符艺术，作为小彩蛋显示在控制台

// 字符艺术：CJH
function printCJH() {
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
function printLittleRabbit() {
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
function printInventorySystem() {
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

// 显示所有彩蛋字符艺术
function showEasterEggs() {
    console.log('='.repeat(60));
    printCJH();
    printLittleRabbit();
    printInventorySystem();
    console.log('='.repeat(60));
    console.log('🎉 欢迎使用盘库管理系统！');
    console.log('💡 开发者：CJH');
    console.log('🐰 小兔子祝您使用愉快！');
    console.log('💬 微信：15127988973');
    console.log('='.repeat(60));
}

// 函数：获取局域网IP地址
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // 跳过IPv6和本地回环地址
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1'; // 默认返回本地地址
}

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 创建HTTP服务器
const server = http.createServer(app);

// 创建WebSocket服务器
const wss = new WebSocket.Server({ server });

// 存储所有连接的客户端，按任务分组
const clients = new Map(); // key: tableName, value: Set<WebSocket>

// WebSocket连接处理
wss.on('connection', (ws, req) => {
    console.log('WebSocket客户端已连接');
    
    // 获取客户端IP地址
    const clientIp = req.socket.remoteAddress;
    console.log('客户端IP:', clientIp);
    
    // 监听客户端消息
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('收到客户端消息:', data);
            
            // 处理客户端订阅请求
            if (data.action === 'subscribe' && data.tableName) {
                // 将客户端添加到对应任务的客户端集合
                if (!clients.has(data.tableName)) {
                    clients.set(data.tableName, new Set());
                }
                clients.get(data.tableName).add(ws);
                console.log(`客户端已订阅任务: ${data.tableName}`);
                
                // 存储客户端订阅的任务表名
                ws.tableName = data.tableName;
                
                // 发送确认消息
                ws.send(JSON.stringify({
                    action: 'subscribed',
                    tableName: data.tableName,
                    message: `已成功订阅任务: ${data.tableName}`
                }));
            }
        } catch (error) {
            console.error('WebSocket消息处理失败:', error);
        }
    });
    
    // 监听客户端断开连接
    ws.on('close', () => {
        console.log('WebSocket客户端已断开连接');
        
        // 将客户端从对应任务的客户端集合中移除
        if (ws.tableName && clients.has(ws.tableName)) {
            const taskClients = clients.get(ws.tableName);
            taskClients.delete(ws);
            console.log(`客户端已取消订阅任务: ${ws.tableName}`);
            
            // 如果任务没有客户端订阅了，清理该任务的客户端集合
            if (taskClients.size === 0) {
                clients.delete(ws.tableName);
            }
        }
    });
    
    // 监听客户端错误
    ws.on('error', (error) => {
        console.error('WebSocket客户端错误:', error);
    });
});

// 广播消息给指定任务的所有客户端
function broadcastMessage(tableName, message) {
    if (!clients.has(tableName)) return;
    
    const taskClients = clients.get(tableName);
    const messageString = JSON.stringify(message);
    
    taskClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageString);
        }
    });
    
    console.log(`已广播消息给任务 ${tableName} 的 ${taskClients.size} 个客户端`);
}

// 中间件
// 显式允许所有来源访问，解决CORS问题
app.use(cors({
    origin: '*', // 允许所有来源
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 允许所有HTTP方法
    allowedHeaders: ['Content-Type', 'Authorization'] // 允许所有头信息
}));
// 增加请求体大小限制，解决413 Payload Too Large错误
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

// 处理OPTIONS请求，用于预检请求
app.options('*', cors());

// SQLite数据库连接 - 使用相对路径，确保在当前目录创建数据库
const dbPath = './inventory.db';
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('SQLite数据库连接失败:', err.message);
        console.error('数据库路径:', dbPath);
        console.error('当前工作目录:', process.cwd());
    } else {
        console.log('成功连接到SQLite数据库:', dbPath);
        // 创建任务表（用于存储所有任务信息）
        createTasksTable();
    }
});

// 创建任务表
function createTasksTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_name TEXT NOT NULL UNIQUE,
            task_name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.run(sql, (err) => {
        if (err) {
            console.error('创建任务表失败:', err.message);
        } else {
            console.log('任务表创建成功');
        }
    });
}

// 根据表名创建库存表
function createInventoryTable(tableName) {
    return new Promise((resolve, reject) => {
        const sql = `
            CREATE TABLE IF NOT EXISTS ${tableName} (
                barcode TEXT PRIMARY KEY,
                name TEXT NOT NULL DEFAULT '未知商品',
                type TEXT NOT NULL DEFAULT '未知类型', -- 添加商品类型字段
                stock INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        db.run(sql, (err) => {
            if (err) {
                console.error(`创建库存表 ${tableName} 失败:`, err.message);
                reject(err);
            } else {
                console.log(`库存表 ${tableName} 创建成功`);
                resolve();
            }
        });
    });
}

// 根据表名创建日志表
function createLogTable(tableName) {
    return new Promise((resolve, reject) => {
        // 日志表名：在库存表名前添加log_前缀
        const logTableName = `log_${tableName}`;
        const sql = `
            CREATE TABLE IF NOT EXISTS ${logTableName} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                barcode TEXT NOT NULL,
                action TEXT NOT NULL,
                old_stock INTEGER NOT NULL,
                new_stock INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                ip_address TEXT NOT NULL DEFAULT 'unknown' -- 添加IP地址字段，存储局域网IP
            )
        `;
        db.run(sql, (err) => {
            if (err) {
                console.error(`创建日志表 ${logTableName} 失败:`, err.message);
                reject(err);
            } else {
                console.log(`日志表 ${logTableName} 创建成功`);
                resolve();
            }
        });
    });
}

// 根据表名创建商品类型表
function createProductTypeTable(tableName) {
    return new Promise((resolve, reject) => {
        // 商品类型表名：在库存表名前添加types_前缀
        const typesTableName = `types_${tableName}`;
        const sql = `
            CREATE TABLE IF NOT EXISTS ${typesTableName} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type_name TEXT NOT NULL UNIQUE,
                default_deduction INTEGER NOT NULL DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        db.run(sql, (err) => {
            if (err) {
                console.error(`创建商品类型表 ${typesTableName} 失败:`, err.message);
                reject(err);
            } else {
                console.log(`商品类型表 ${typesTableName} 创建成功`);
                resolve();
            }
        });
    });
}

// API接口

// 获取所有任务列表
app.get('/api/tasks', (req, res) => {
    const sql = 'SELECT * FROM tasks ORDER BY created_at DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 创建新任务
app.post('/api/tasks', async (req, res) => {
    const { tableName, taskName } = req.body;
    
    if (!tableName || !taskName) {
        res.status(400).json({ error: 'tableName和taskName是必填字段' });
        return;
    }
    
    try {
        // 创建库存表
        await createInventoryTable(tableName);
        // 创建对应的日志表
        await createLogTable(tableName);
        // 创建对应的商品类型表
        await createProductTypeTable(tableName);
        
        // 插入任务记录
        const sql = `
            INSERT INTO tasks (table_name, task_name, created_at, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        db.run(sql, [tableName, taskName], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, tableName, taskName });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 获取指定任务的库存数据
app.get('/api/inventory/:tableName', (req, res) => {
    const { tableName } = req.params;
    const sql = `SELECT * FROM ${tableName} ORDER BY barcode`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 获取指定任务的商品类型列表
app.get('/api/types/:tableName', (req, res) => {
    const { tableName } = req.params;
    const typesTableName = `types_${tableName}`;
    const sql = `SELECT * FROM ${typesTableName} ORDER BY type_name`;
    
    console.log('API - 获取商品类型列表:', { tableName, typesTableName });
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('API - 获取商品类型列表失败:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        
        console.log('API - 获取商品类型列表成功:', rows.length, '条记录', rows);
        res.json(rows);
    });
});

// 添加新的商品类型
app.post('/api/types/:tableName', (req, res) => {
    const { tableName } = req.params;
    const { type_name, default_deduction = 1 } = req.body;
    
    if (!type_name) {
        res.status(400).json({ error: 'type_name是必填字段' });
        return;
    }
    
    const typesTableName = `types_${tableName}`;
    const sql = `
        INSERT INTO ${typesTableName} (type_name, default_deduction, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(type_name) DO UPDATE SET
        default_deduction = excluded.default_deduction,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    db.run(sql, [type_name, default_deduction], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, type_name, default_deduction });
    });
});

// 更新商品类型
app.put('/api/types/:tableName/:id', (req, res) => {
    const { tableName, id } = req.params;
    const { type_name, default_deduction } = req.body;
    
    if (!type_name || default_deduction === undefined) {
        res.status(400).json({ error: 'type_name和default_deduction是必填字段' });
        return;
    }
    
    const typesTableName = `types_${tableName}`;
    const sql = `
        UPDATE ${typesTableName}
        SET type_name = ?, default_deduction = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    
    db.run(sql, [type_name, default_deduction, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: '未找到指定的商品类型' });
            return;
        }
        
        res.json({ id, type_name, default_deduction });
    });
});

// 删除商品类型
app.delete('/api/types/:tableName/:id', (req, res) => {
    const { tableName, id } = req.params;
    const typesTableName = `types_${tableName}`;
    
    const sql = `DELETE FROM ${typesTableName} WHERE id = ?`;
    db.run(sql, [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: '未找到指定的商品类型' });
            return;
        }
        
        res.json({ message: '商品类型删除成功' });
    });
});

// 获取指定任务的单个条码库存数据
app.get('/api/inventory/:tableName/barcode/:barcode', (req, res) => {
    const { tableName, barcode } = req.params;
    const sql = `SELECT * FROM ${tableName} WHERE barcode = ?`;
    
    db.get(sql, [barcode], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (!row) {
            res.status(404).json({ error: '未找到指定条码' });
            return;
        }
        
        res.json(row);
    });
});

// 导入库存数据
app.post('/api/inventory/:tableName/import', (req, res) => {
    const { tableName } = req.params;
    const inventoryData = req.body;
    
    if (!Array.isArray(inventoryData)) {
        res.status(400).json({ error: '库存数据必须是数组格式' });
        return;
    }
    
    // 开始事务
    db.serialize(() => {
        // 清空现有数据
        const clearSql = `DELETE FROM ${tableName}`;
        db.run(clearSql, (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            // 插入新数据
            const insertSql = `
                INSERT INTO ${tableName} (barcode, name, type, stock, created_at, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT(barcode) DO UPDATE SET
                name = excluded.name,
                type = excluded.type,
                stock = excluded.stock,
                updated_at = CURRENT_TIMESTAMP
            `;
            
            const stmt = db.prepare(insertSql);
            let count = 0;
            
            inventoryData.forEach(item => {
                stmt.run([item.barcode, item.name || '未知商品', item.type || '未知类型', item.stock], (err) => {
                    if (err) {
                        console.error('插入数据失败:', err.message);
                    } else {
                        count++;
                    }
                });
            });
            
            stmt.finalize((err) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                
                // 更新任务的updated_at时间
                const updateTaskSql = `
                    UPDATE tasks
                    SET updated_at = CURRENT_TIMESTAMP
                    WHERE table_name = ?
                `;
                db.run(updateTaskSql, [tableName], (err) => {
                    if (err) {
                        console.error('更新任务时间失败:', err.message);
                    }
                });
                
                res.json({ message: '库存数据导入成功', count });
            });
        });
    });
});

// 获取指定任务的日志
app.get('/api/logs/:tableName', (req, res) => {
    const { tableName } = req.params;
    const logTableName = `log_${tableName}`;
    
    const sql = `SELECT * FROM ${logTableName} ORDER BY created_at DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(`获取日志失败:`, err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 添加日志记录
function addLogEntry(tableName, barcode, action, oldStock, newStock, ipAddress = 'unknown') {
    return new Promise((resolve, reject) => {
        const logTableName = `log_${tableName}`;
        
        // 先检查并更新日志表结构，确保包含ip_address字段
        updateLogTableStructure(logTableName)
            .then(() => {
                // 表结构更新完成后，插入日志记录
                const sql = `
                    INSERT INTO ${logTableName} (barcode, action, old_stock, new_stock, created_at, ip_address)
                    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
                `;
                db.run(sql, [barcode, action, oldStock, newStock, ipAddress], function(err) {
                    if (err) {
                        console.error(`添加日志失败:`, err.message);
                        reject(err);
                    } else {
                        // 日志添加成功后，广播给所有订阅了该任务的客户端
                        const logId = this.lastID;
                        
                        // 获取完整的日志信息
                        const getLogSql = `SELECT * FROM ${logTableName} WHERE id = ?`;
                        db.get(getLogSql, [logId], (err, log) => {
                            if (!err && log) {
                                // 广播日志更新消息
                                broadcastMessage(tableName, {
                                    action: 'log_update',
                                    tableName: tableName,
                                    log: log
                                });
                            }
                            resolve(logId);
                        });
                    }
                });
            })
            .catch(err => {
                console.error(`更新日志表结构失败:`, err.message);
                reject(err);
            });
    });
}

// 更新日志表结构，确保包含ip_address字段
function updateLogTableStructure(logTableName) {
    return new Promise((resolve, reject) => {
        // 检查是否存在ip_address字段
        const checkSql = `PRAGMA table_info(${logTableName})`;
        db.all(checkSql, [], (err, columns) => {
            if (err) {
                reject(err);
                return;
            }
            
            // 检查是否存在ip_address字段
            const hasIpColumn = columns.some(col => col.name === 'ip_address');
            if (hasIpColumn) {
                // 如果已经有ip_address字段，直接返回
                resolve();
                return;
            }
            
            // 如果没有ip_address字段，添加该字段
            const addColumnSql = `ALTER TABLE ${logTableName} ADD COLUMN ip_address TEXT NOT NULL DEFAULT 'unknown'`;
            db.run(addColumnSql, (err) => {
                if (err) {
                    console.error(`添加ip_address字段失败:`, err.message);
                    reject(err);
                } else {
                    console.log(`日志表 ${logTableName} 已添加ip_address字段`);
                    resolve();
                }
            });
        });
    });
}

// 更新库存（扣除）
app.put('/api/inventory/:tableName/:barcode', (req, res) => {
    const { tableName, barcode } = req.params;
    const { stock } = req.body;
    
    // 声明localIp变量
    let localIp = 'unknown';
    
    // 获取客户端的IP地址（局域网IP）
    let ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // 处理IP地址，确保获取正确的局域网IP
    if (ipAddress) {
        // 如果是通过代理，可能有多个IP地址，取第一个
        if (ipAddress.includes(',')) {
            ipAddress = ipAddress.split(',')[0].trim();
        }
        
        // 处理IPv4地址
        if (ipAddress.match(/^\d+\.\d+\.\d+\.\d+$/)) {
            // 这是一个IPv4地址，直接使用
            localIp = ipAddress;
        }
        // 处理IPv6地址，特别是本地回环地址
        else if (ipAddress === '::1' || ipAddress === 'localhost') {
            // 本地请求，设置为localhost
            localIp = 'localhost';
        }
        // 处理其他IPv6地址
        else if (ipAddress.startsWith('::ffff:')) {
            // IPv6格式的IPv4地址，提取IPv4部分
            localIp = ipAddress.replace('::ffff:', '');
        }
        // 处理其他情况
        else {
            // 尝试提取IP地址，去除端口号
            localIp = ipAddress.replace(/:[0-9]+$/, '');
        }
    } else {
        localIp = 'unknown';
    }
    
    // 确保IP地址格式正确
    localIp = localIp.trim();
    if (!localIp || localIp === '') {
        localIp = 'unknown';
    }
    
    // 先获取当前库存
    const getCurrentStockSql = `SELECT stock FROM ${tableName} WHERE barcode = ?`;
    db.get(getCurrentStockSql, [barcode], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (!row) {
            res.status(404).json({ error: '未找到指定条码' });
            return;
        }
        
        const oldStock = row.stock;
        
        // 更新库存
        const updateSql = `
            UPDATE ${tableName}
            SET stock = ?, updated_at = CURRENT_TIMESTAMP
            WHERE barcode = ?
        `;
        
        db.run(updateSql, [stock, barcode], async function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (this.changes === 0) {
                res.status(404).json({ error: '未找到指定条码' });
                return;
            }
            
            // 添加日志记录，包含IP地址
            try {
                await addLogEntry(tableName, barcode, '扣除库存', oldStock, stock, localIp);
            } catch (logErr) {
                console.error('添加日志失败:', logErr);
            }
            
            // 更新任务的updated_at时间
            const updateTaskSql = `
                UPDATE tasks
                SET updated_at = CURRENT_TIMESTAMP
                WHERE table_name = ?
            `;
            db.run(updateTaskSql, [tableName], (err) => {
                if (err) {
                    console.error('更新任务时间失败:', err.message);
                }
            });
            
            res.json({ message: '库存更新成功', barcode, stock, ip_address: localIp });
        });
    });
});

// 删除任务
app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    
    // 先获取任务信息
    const getTaskSql = 'SELECT table_name FROM tasks WHERE id = ?';
    db.get(getTaskSql, [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (!row) {
            res.status(404).json({ error: '未找到指定任务' });
            return;
        }
        
        const tableName = row.table_name;
        const logTableName = `log_${tableName}`;
        
        // 开始事务
        db.serialize(() => {
            // 删除库存表
            const dropTableSql = `DROP TABLE IF EXISTS ${tableName}`;
            db.run(dropTableSql, (err) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                
                // 删除对应的日志表
                const dropLogTableSql = `DROP TABLE IF EXISTS ${logTableName}`;
                db.run(dropLogTableSql, (err) => {
                    if (err) {
                        console.error(`删除日志表 ${logTableName} 失败:`, err.message);
                        // 继续执行，不影响主流程
                    }
                    
                    // 删除对应的商品类型表
                    const typesTableName = `types_${tableName}`;
                    const dropTypesTableSql = `DROP TABLE IF EXISTS ${typesTableName}`;
                    db.run(dropTypesTableSql, (err) => {
                        if (err) {
                            console.error(`删除商品类型表 ${typesTableName} 失败:`, err.message);
                            // 继续执行，不影响主流程
                        }
                        
                        // 删除任务记录
                        const deleteTaskSql = 'DELETE FROM tasks WHERE id = ?';
                        db.run(deleteTaskSql, [id], function(err) {
                            if (err) {
                                res.status(500).json({ error: err.message });
                                return;
                            }
                            
                            res.json({ message: '任务删除成功' });
                        });
                    });
                });
            });
        });
    });
});

// 启动服务器，监听所有网络接口（0.0.0.0）
server.listen(PORT, '0.0.0.0', () => {
    // 获取局域网IP地址
    const localIP = getLocalIP();
    const serverUrl = `http://${localIP}:${PORT}`;
    
    // 显示彩蛋字符艺术
    showEasterEggs();
    
    console.log('========================================');
    console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
    console.log(`前端页面: ${serverUrl}`);
    console.log('WebSocket服务已启动，支持日志实时推送');
    console.log(`局域网内设备可以通过 ${localIP}:${PORT} 访问本系统`);
    console.log('========================================');
    
    // 生成并打印二维码
    console.log('访问二维码:');
    qrcode.toString(serverUrl, { type: 'terminal' }, (err, qr) => {
        if (err) {
            console.error('生成二维码失败:', err.message);
        } else {
            console.log(qr);
        }
    });
});

// 关闭数据库连接
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('关闭数据库连接失败:', err.message);
        } else {
            console.log('数据库连接已关闭');
        }
        process.exit(0);
    });
});