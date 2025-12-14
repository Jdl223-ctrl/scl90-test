import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // Vercel 环境变量
let client;

async function getClient() {
  if (!client) client = new MongoClient(uri);
  if (!client.isConnected?.()) await client.connect();
  return client;
}

export default async function handler(req,res){
  const { token, answers } = req.body;
  const today = new Date().toISOString().slice(0,10);

  // 校验每日 token
  if(token!==today) return res.status(403).json({msg:'链接已失效'});

  try{
    const client = await getClient();
    const db = client.db('scl90test');
    await db.collection('results').insertOne({
      date: today,
      answers,
      createdAt: new Date()
    });
    res.status(200).json({success:true});
  } catch(err){
    console.error(err);
    res.status(500).json({msg:'服务器错误'});
  }
}
