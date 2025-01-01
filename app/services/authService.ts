'use client';

import { UserRole } from '../types/auth';

export class AuthService {
  private static instance: AuthService;
  private rolePasswords: Map<UserRole, string>;

  private constructor() {
    this.rolePasswords = new Map([
      ['developer', 'dev123'],
      ['manager', 'mgr123'],
      ['admin', 'adm123']
    ]);
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  public validatePassword(password: string): boolean {
    // Password requirements:
    // - At least 6 characters
    // - Contains at least one number
    // - Contains at least one letter
    return password.length >= 6 &&
           /\d/.test(password) &&
           /[a-zA-Z]/.test(password);
  }

  public async verifyRolePassword(role: UserRole, password: string): Promise<boolean> {
    if (!this.rolePasswords.has(role)) {
      return true; // No password required for this role
    }

    const hashedInput = await this.hashPassword(password);
    const hashedStored = await this.hashPassword(this.rolePasswords.get(role)!);
    return hashedInput === hashedStored;
  }

  public getRolePasswordRequirements(role: UserRole): string {
    if (!this.rolePasswords.has(role)) {
      return '';
    }
    return 'Password must be at least 6 characters and contain both letters and numbers';
  }
}
