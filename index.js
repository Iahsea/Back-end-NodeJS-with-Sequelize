// const express = require('express')
import express from 'express'
import dotenv from 'dotenv'
import { getProducts } from './controllers/ProductController'
dotenv.config()
import db from './models'
const os = require('os');


const app = express()
app.use(express.json())
express.urlencoded({ extended: true })
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    next();
});

import { AppRoute } from './AppRoute'

app.get('/', (req, res) => {
    res.send('This is Online ShopApp using NodeJS + ReactJS')
})


app.get('/api/healthcheck', async (req, res) => {
    try {
        // Kiểm tra kết nối cơ sở dữ liệu
        await db.sequelize.authenticate();

        // Lấy thông tin tải CPU
        const cpuLoad = os.loadavg(); // Trả về tải trung bình trong 1, 5, và 15 phút

        // Tính toán tải CPU trong %
        const cpus = os.cpus();
        const cpuPercentage = (cpuLoad[0] / cpus.length) * 100;

        const memoryUsage = process.memoryUsage();
        const memoryUsageMB = {
            rss: (memoryUsage.rss / 1024 / 1024).toFixed(2) + 'MB',
            heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2) + 'MB',
            heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2) + 'MB',
            external: (memoryUsage.external / 1024 / 1024).toFixed(2) + 'MB',
        };
        // Trả về kết quả
        res.status(200).json({
            status: 'OK',
            database: 'Connected',
            cpuLoad: {
                '1 Minute Average Load': cpuLoad[0].toFixed(2),
                '5 Minute Average Load': cpuLoad[1].toFixed(2),
                '15 Minute Average Load': cpuLoad[2].toFixed(2),
                'CPU Usage Percentage': cpuPercentage.toFixed(2) + '%'
            },
            memoryUsage: memoryUsageMB
        });
    } catch (error) {
        res.status(500).json({
            status: 'Failed',
            message: 'Health check failed',
            error: error.message
        });
    }
});



const port = process?.env?.PORT ?? 3321

AppRoute(app)

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${port}`)
})