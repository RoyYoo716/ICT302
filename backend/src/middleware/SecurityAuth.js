const { supabaseServer } = require('../config/SupabaseServerClient');

const verifySecuritySession = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseServer.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

module.exports = { verifySecuritySession };
