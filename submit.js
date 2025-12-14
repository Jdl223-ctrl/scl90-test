export default function handler(req, res) {
  const { token } = req.body;          // 获取前端提交的 token
  const today = new Date().toISOString().slice(0, 10); // 获取今天日期

  // 校验 token 是否为今天
  if (token !== today) {
    return res.status(403).json({ msg: '链接已失效' });
  }

  // 这里可以保存结果到数据库（可选）
  // 例如：MongoDB / MySQL / Google Sheets

  res.status(200).json({ success: true }); // 返回成功
}
