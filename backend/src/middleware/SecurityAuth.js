import { supabaseServer } from '../config/SupabaseServerClient.js';

export async function verifySecuritySession(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Unauthorized: Missing security token." });
    }

    const token = authHeader.split(' ')[1];
    
    await supabaseServer.auth.setSession({
      access_token: token,
      refresh_token: ''
    });

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid security session context." });
  }
}
