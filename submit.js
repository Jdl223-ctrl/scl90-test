import { MongoClient } from 'mongodb';

let cachedClient = null;

async function connectDB() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { token, answers, summary, level, reportId } = req.body;

    if (!token || !answers || !reportId) {
      return res.status(400).json({ message: '参数不完整' });
    }

    const client = await connectDB();
    const db = client.db('scl90');
    const col = db.collection('results');

    // 校验是否当日 token 已存在
    const exists = await col.findOne({ token });
    if (exists) {
      return res.status(403).json({ message: '你今天已经完成过测试' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const doc = {
      token,
      answers,              // 90 题原始作答（可选）
      level,                // 情绪状态等级（不使用病名）
      summary,              // 治愈型总结文本
      reportId,             // 报告编号
      createdAt: new Date()
    };

    await col.insertOne(doc);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
}

