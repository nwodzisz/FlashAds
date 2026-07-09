import { Router } from 'express';
import { query } from '../db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const router = Router();

// Endpoint to request a password reset link
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Determine if the user is a publisher/admin or advertiser
    let userType = null;
    
    const userResult = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rowCount && userResult.rowCount > 0) {
      userType = 'user'; // applies to both publisher and admin since they use the same table/login
    } else {
      const advResult = await query('SELECT id FROM advertisers WHERE email = $1', [email]);
      if (advResult.rowCount && advResult.rowCount > 0) {
        userType = 'advertiser';
      }
    }

    if (!userType) {
      // Don't leak whether the email exists or not for security reasons.
      return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Store the reset token in the database
    await query(
      'INSERT INTO password_resets (email, user_type, token, expires_at) VALUES ($1, $2, $3, $4)',
      [email, userType, token, expiresAt]
    );

    // Provide the reset link based on the user type
    let resetLink = '';
    if (userType === 'user') {
      // Publisher/Admin frontend link
      resetLink = `${process.env.FRONTEND_URL || 'http://townticker.nathanwodzisz.com'}/reset-password?token=${token}`;
    } else {
      // Advertiser frontend link
      resetLink = `${process.env.ADVERTISER_FRONTEND_URL || 'http://towntickerclient.nathanwodzisz.com'}/reset-password?token=${token}`;
    }

    // SIMULATED EMAIL DELIVERY
    console.log('================================================================');
    console.log(`PASSWORD RESET REQUESTED FOR: ${email}`);
    console.log(`RESET LINK: ${resetLink}`);
    console.log('================================================================');

    res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to reset the password using the token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Find the token
    const { rows } = await query(
      'SELECT email, user_type, expires_at FROM password_resets WHERE token = $1',
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const resetRequest = rows[0];

    // Check if it's expired
    if (new Date(resetRequest.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash the new password
    const password_hash = await bcrypt.hash(newPassword, 10);

    // Update the password in the appropriate table
    if (resetRequest.user_type === 'user') {
      await query('UPDATE users SET password_hash = $1 WHERE email = $2', [password_hash, resetRequest.email]);
    } else if (resetRequest.user_type === 'advertiser') {
      await query('UPDATE advertisers SET password_hash = $1 WHERE email = $2', [password_hash, resetRequest.email]);
    }

    // Delete the used token
    await query('DELETE FROM password_resets WHERE token = $1', [token]);

    res.json({ success: true, message: 'Password has been successfully reset' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
