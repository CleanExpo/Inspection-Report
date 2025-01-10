import { AuthError } from '../utils/auth';
import { hash, compare } from 'bcrypt';

// Mock user data for testing
// In production, this would be replaced with database queries
const MOCK_USERS = new Map([
    ['admin@example.com', {
        userId: '1',
        email: 'admin@example.com',
        passwordHash: '$2b$10$YaB6xpBcJe8Nc7rtAa7zqOYVZej0fpBCnp8ZW3nqZvh1uEoZGXhC6', // 'admin123'
        roles: ['ADMIN']
    }],
    ['user@example.com', {
        userId: '2',
        email: 'user@example.com',
        passwordHash: '$2b$10$YaB6xpBcJe8Nc7rtAa7zqOYVZej0fpBCnp8ZW3nqZvh1uEoZGXhC6', // 'user123'
        roles: ['USER']
    }]
]);

export interface UserData {
    userId: string;
    email: string;
    roles: string[];
}

/**
 * Validates user credentials
 * @param email User email
 * @param password User password
 * @returns User data if credentials are valid
 * @throws {AuthError} If credentials are invalid
 */
export async function validateCredentials(email: string, password: string): Promise<UserData> {
    const user = MOCK_USERS.get(email);
    
    if (!user) {
        throw new AuthError('Invalid email or password', 401);
    }

    const isValid = await compare(password, user.passwordHash);
    if (!isValid) {
        throw new AuthError('Invalid email or password', 401);
    }

    return {
        userId: user.userId,
        email: user.email,
        roles: user.roles
    };
}

/**
 * Creates a new user
 * @param email User email
 * @param password User password
 * @param roles User roles
 * @returns Created user data
 */
export async function createUser(email: string, password: string, roles: string[]): Promise<UserData> {
    if (MOCK_USERS.has(email)) {
        throw new AuthError('Email already exists', 400);
    }

    const passwordHash = await hash(password, 10);
    const userId = (MOCK_USERS.size + 1).toString();

    const userData = {
        userId,
        email,
        passwordHash,
        roles
    };

    MOCK_USERS.set(email, userData);

    return {
        userId,
        email,
        roles
    };
}

/**
 * Gets user data by email
 * @param email User email
 * @returns User data if found
 * @throws {AuthError} If user not found
 */
export function getUserByEmail(email: string): UserData {
    const user = MOCK_USERS.get(email);
    if (!user) {
        throw new AuthError('User not found', 404);
    }

    return {
        userId: user.userId,
        email: user.email,
        roles: user.roles
    };
}

/**
 * Gets user data by ID
 * @param userId User ID
 * @returns User data if found
 * @throws {AuthError} If user not found
 */
export function getUserById(userId: string): UserData {
    for (const user of Array.from(MOCK_USERS.values())) {
        if (user.userId === userId) {
            return {
                userId: user.userId,
                email: user.email,
                roles: user.roles
            };
        }
    }
    throw new AuthError('User not found', 404);
}

/**
 * Updates user roles
 * @param userId User ID
 * @param roles New roles
 * @returns Updated user data
 */
export function updateUserRoles(userId: string, roles: string[]): UserData {
    for (const [email, user] of Array.from(MOCK_USERS.entries())) {
        if (user.userId === userId) {
            const updatedUser = {
                ...user,
                roles
            };
            MOCK_USERS.set(email, updatedUser);
            return {
                userId: updatedUser.userId,
                email: updatedUser.email,
                roles: updatedUser.roles
            };
        }
    }
    throw new AuthError('User not found', 404);
}
