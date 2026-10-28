import { AuthResponse, User } from '../types';

export function mapUserFromDto(raw: any): User {
  return {
    id: raw.id || raw.user_id || raw._id || '',
    name: raw.name || raw.full_name || raw.username || 'مستخدم',
    email: raw.email || '',
    role: (raw.role || 'CUSTOMER').toUpperCase() as User['role'],
    avatar: raw.avatar || raw.avatar_url,
  };
}

export function mapAuthResponseFromDto(raw: any): AuthResponse {
  return {
    user: mapUserFromDto(raw.user || raw.data?.user || raw),
    token: raw.token || raw.access_token || raw.jwt || '',
    expiresIn: raw.expires_in || raw.expiresIn,
  };
}
