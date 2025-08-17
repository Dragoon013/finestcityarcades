import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from '@vercel/postgres';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 12;

export async function hashPassword(password) {
	return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
	return await bcrypt.compare(password, hash);
}

export function generateToken(user) {
	return jwt.sign(
		{ 
			id: user.id, 
			username: user.username, 
			email: user.email,
			role: user.role 
		},
		JWT_SECRET,
		{ expiresIn: '7d' }
	);
}

export function verifyToken(token) {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (error) {
		return null;
	}
}

export async function createAdminUser(username, email, password) {
	try {
		const passwordHash = await hashPassword(password);
		
		const { rows } = await sql`
			INSERT INTO admin_users (username, email, password_hash)
			VALUES (${username}, ${email}, ${passwordHash})
			RETURNING id, username, email, role, created_at
		`;
		
		return rows[0];
	} catch (error) {
		if (error.message.includes('duplicate key')) {
			throw new Error('Username or email already exists');
		}
		throw error;
	}
}

export async function authenticateUser(username, password) {
	try {
		const { rows } = await sql`
			SELECT id, username, email, password_hash, role, active
			FROM admin_users 
			WHERE (username = ${username} OR email = ${username}) AND active = true
		`;
		
		if (rows.length === 0) {
			return null;
		}
		
		const user = rows[0];
		const isValidPassword = await verifyPassword(password, user.password_hash);
		
		if (!isValidPassword) {
			return null;
		}
		
		// Update last login
		await sql`
			UPDATE admin_users 
			SET last_login = CURRENT_TIMESTAMP 
			WHERE id = ${user.id}
		`;
		
		// Return user without password hash
		const { password_hash, ...userWithoutPassword } = user;
		return userWithoutPassword;
	} catch (error) {
		console.error('Authentication error:', error);
		return null;
	}
}

export async function getUserFromToken(token) {
	const decoded = verifyToken(token);
	if (!decoded) {
		return null;
	}
	
	try {
		const { rows } = await sql`
			SELECT id, username, email, role, active
			FROM admin_users 
			WHERE id = ${decoded.id} AND active = true
		`;
		
		return rows.length > 0 ? rows[0] : null;
	} catch (error) {
		console.error('Error getting user from token:', error);
		return null;
	}
}

export function setAuthCookie(cookies, token) {
	const cookieOptions = {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
		maxAge: 60 * 60 * 24 * 7 // 7 days
	};
	
	console.log('Setting auth cookie with options:', cookieOptions);
	cookies.set('auth_token', token, cookieOptions);
}

export function clearAuthCookie(cookies) {
	cookies.delete('auth_token', { path: '/' });
}
