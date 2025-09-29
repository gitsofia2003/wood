require('dotenv').config({ path: './.env.local' });
const { S3Client, PutBucketCorsCommand } = require("@aws-sdk/client-s3");

// --- Ваши данные ---
const BUCKET_NAME = process.env.REACT_APP_S3_BUCKET_NAME;
const REGION = process.env.REACT_APP_S3_REGION;
const ACCESS_KEY = process.env.REACT_APP_S3_ACCESS_KEY;
const SECRET_KEY = process.env.REACT_APP_S3_SECRET_KEY;
const YOUR_WEBSITE_URL = 'https://wood-livid.vercel.app'; // URL вашего сайта

// Проверка, что все переменные загрузились
if (!BUCKET_NAME || !REGION || !ACCESS_KEY || !SECRET_KEY) {
    console.error("Ошибка: Не удалось загрузить переменные окружения из .env.local");
    console.error("Убедитесь, что файл .env.local находится в той же папке и содержит все REACT_APP_... переменные.");
    process.exit(1);
}

// Конфигурация клиента S3
const s3Client = new S3Client({
    endpoint: `https://s3.${REGION}.storage.selcloud.ru`,
    region: REGION,
    credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY,
    }
});

// Определение правил CORS
const corsRules = {
    Bucket: BUCKET_NAME,
    CORSConfiguration: {
        CORSRules: [
            {
                AllowedHeaders: ["*"], // Разрешаем все заголовки
                AllowedMethods: ["PUT", "POST", "DELETE", "GET"],
                AllowedOrigins: [YOUR_WEBSITE_URL],
                ExposeHeaders: [],
                MaxAgeSeconds: 3000,
            },
        ],
    },
};

// Функция для установки правил
const setCors = async () => {
    console.log(`Установка CORS правил для бакета "${BUCKET_NAME}"...`);
    try {
        const command = new PutBucketCorsCommand(corsRules);
        const response = await s3Client.send(command);
        console.log("\nУСПЕХ! Правила CORS успешно установлены.");
        console.log("Статус ответа:", response.$metadata.httpStatusCode);
    } catch (err) {
        console.error("\nОШИБКА при установке CORS правил:", err);
    }
};

setCors();