const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Token'ı header'dan al
  const token = req.header('x-auth-token');

  // Token yoksa reddet
  if (!token) {
    return res.status(401).json({ msg: 'Token yok, yetkilendirme reddedildi' });
  }

  // Token doğrula
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token geçersiz' });
  }
};