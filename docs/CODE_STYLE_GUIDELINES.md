# Code Style Guidelines and Best Practices

This document outlines the coding standards, style guidelines, and best practices for the Sugar Daddy Platform development team.

## Table of Contents

1. [General Guidelines](#general-guidelines)
2. [TypeScript Guidelines](#typescript-guidelines)
3. [React Guidelines](#react-guidelines)
4. [Node.js/Express Guidelines](#nodejsexpress-guidelines)
5. [Database Guidelines](#database-guidelines)
6. [Security Guidelines](#security-guidelines)
7. [Performance Guidelines](#performance-guidelines)
8. [Testing Guidelines](#testing-guidelines)
9. [Git Guidelines](#git-guidelines)
10. [Documentation Guidelines](#documentation-guidelines)

## General Guidelines

### Code Organization

- **Single Responsibility Principle**: Each function/class should have one reason to change
- **Separation of Concerns**: Keep business logic, presentation, and data access separate
- **DRY (Don't Repeat Yourself)**: Avoid code duplication
- **KISS (Keep It Simple, Stupid)**: Prefer simple solutions over complex ones

### Naming Conventions

#### Files and Directories
```bash
# Use kebab-case for file names
user-profile.ts
enhanced-login.tsx
api-routes.ts

# Use PascalCase for components
UserProfile.tsx
EnhancedLogin.tsx
```

#### Variables and Functions
```typescript
// Use camelCase for variables and functions
const userProfile = getUserProfile();
const isEmailValid = validateEmail(email);

// Use descriptive names
const userAuthenticationToken = generateAuthToken();
const subscriptionEndDate = getSubscriptionExpiry();
```

#### Constants
```typescript
// Use UPPER_SNAKE_CASE for constants
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_PAGE_SIZE = 20;
const JWT_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours
```

#### Classes and Interfaces
```typescript
// Use PascalCase for classes and interfaces
class UserProfileService {}
interface UserPreferences {}
type SubscriptionPlan = 'basic' | 'premium' | 'platinum';
```

### Code Formatting

#### Indentation
- Use 2 spaces for indentation (no tabs)
- Configure your editor to insert spaces when pressing Tab

#### Line Length
- Maximum line length: 80 characters
- Break long lines at logical points
- Use parentheses for multi-line expressions

```typescript
// Good
const result = await userService.createUser({
  email: userEmail,
  password: userPassword,
  preferences: userPreferences
});

// Bad
const result = await userService.createUser({ email: userEmail, password: userPassword, preferences: userPreferences });
```

#### Spacing
```typescript
// Good
function calculateTotal(items: Item[]): number {
  return items.reduce((total, item) => total + item.price, 0);
}

// Bad
function calculateTotal(items:Item[]):number{
  return items.reduce((total,item)=>total+item.price,0);
}
```

## TypeScript Guidelines

### Type Definitions

#### Always Use Types
```typescript
// Good
interface User {
  id: string;
  email: string;
  profile: UserProfile;
}

// Bad
interface User {
  id: any;
  email: any;
  profile: any;
}
```

#### Avoid `any` Type
```typescript
// Good
type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

// Bad
const response: any = await fetch('/api/users');
```

#### Use Union Types
```typescript
// Good
type UserRole = 'user' | 'premium' | 'admin';
type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'expired';

// Bad
type UserRole = string;
```

### Interfaces vs Types

```typescript
// Use interfaces for object shapes
interface User {
  id: string;
  email: string;
}

// Use types for unions, primitives, or complex types
type UserRole = 'user' | 'premium' | 'admin';
type UserPreferences = Record<string, unknown>;
```

### Generics

```typescript
// Good
function createArray<T>(length: number, value: T): T[] {
  return Array(length).fill(value);
}

// Bad
function createArray(length: number, value: any): any[] {
  return Array(length).fill(value);
}
```

### Optional Properties

```typescript
// Good
interface UserUpdate {
  email?: string;
  profile?: Partial<UserProfile>;
  preferences?: UserPreferences;
}

// Bad
interface UserUpdate {
  email: string | undefined;
  profile: UserProfile | undefined;
}
```

## React Guidelines

### Component Structure

#### Functional Components
```typescript
// Good
interface UserProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
  // Component logic
  return <div>...</div>;
};

// Bad
function UserProfile(props) {
  return <div>...</div>;
}
```

#### Component Naming
```typescript
// Good
const UserProfile = () => { ... };
const EnhancedLogin = () => { ... };

// Bad
const userProfile = () => { ... };
const enhanced_login = () => { ... };
```

### State Management

#### useState
```typescript
// Good
const [user, setUser] = useState<User | null>(null);
const [isLoading, setIsLoading] = useState<boolean>(false);

// Bad
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(false);
```

#### useEffect
```typescript
// Good
useEffect(() => {
  const fetchUser = async () => {
    try {
      const userData = await userService.getUser(userId);
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  fetchUser();
}, [userId]); // Include all dependencies

// Bad
useEffect(() => {
  fetchUser();
}, []); // Missing dependencies
```

#### Custom Hooks
```typescript
// Good
const useUserProfile = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await userService.getUser(userId);
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, refetch: fetchUser };
};

// Bad
const useUserProfile = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const userData = await userService.getUser(userId);
      setUser(userData);
      setLoading(false);
    };

    fetchUser();
  }, [userId]);

  return { user, loading };
};
```

### Performance Optimization

#### Memoization
```typescript
// Good
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(userPreferences);
}, [userPreferences]);

const handleUserUpdate = useCallback((userData: User) => {
  updateUser(userData);
}, [updateUser]);
```

#### Virtualization
```typescript
// Good for long lists
import { FixedSizeList as List } from 'react-window';

const UserList = ({ users }: { users: User[] }) => (
  <List
    height={600}
    itemCount={users.length}
    itemSize={50}
    itemData={users}
  >
    {({ index, style, data }) => (
      <div style={style}>
        {data[index].name}
      </div>
    )}
  </List>
);
```

## Node.js/Express Guidelines

### Route Organization

#### Route Structure
```typescript
// Good - Organized by resource
// routes/users.ts
router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// Bad - Mixed routes
router.get('/users', getUsers);
router.post('/create-user', createUser);
router.get('/user/:id', getUser);
```

#### Middleware Usage
```typescript
// Good
app.use(express.json());
app.use('/api', authMiddleware);
app.use('/api/users', userRoutes);

// Bad
app.use(express.json());
app.get('/api/users', authMiddleware, getUsers);
app.post('/api/users', authMiddleware, express.json(), createUser);
```

### Error Handling

#### Custom Error Classes
```typescript
// Good
class ValidationError extends Error {
  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Usage
if (!email) {
  throw new ValidationError('Email is required', 'email');
}
```

#### Error Middleware
```typescript
// Good
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      message: error.message,
      field: error.field
    });
  }

  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});
```

### Async/Await

```typescript
// Good
app.get('/api/users/:id', async (req, res, next) => {
  try {
    const user = await userService.getUser(req.params.id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// Bad
app.get('/api/users/:id', (req, res) => {
  userService.getUser(req.params.id)
    .then(user => res.json({ success: true, user }))
    .catch(error => res.status(500).json({ success: false, error }));
});
```

## Database Guidelines

### Sequelize Models

#### Model Definition
```typescript
// Good
@Table({ tableName: 'users' })
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  email!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  password!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
```

#### Associations
```typescript
// Good
User.hasOne(UserProfile, { foreignKey: 'userId' });
UserProfile.belongsTo(User, { foreignKey: 'userId' });

// Bad - Circular dependencies
User.hasOne(UserProfile);
UserProfile.hasOne(User);
```

### Queries

#### Use ORM Methods
```typescript
// Good
const users = await User.findAll({
  where: { isActive: true },
  include: [UserProfile],
  limit: 20,
  offset: 0
});

// Bad
const users = await sequelize.query(
  'SELECT * FROM users WHERE is_active = true LIMIT 20 OFFSET 0'
);
```

#### Transactions
```typescript
// Good
const transaction = await sequelize.transaction();
try {
  const user = await User.create(userData, { transaction });
  await UserProfile.create(profileData, { transaction });
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

## Security Guidelines

### Input Validation

```typescript
// Good
const validateUserInput = (input: unknown): UserInput => {
  if (!isObject(input)) {
    throw new ValidationError('Invalid input format');
  }

  const { email, password, username } = input as UserInput;

  if (!isEmail(email)) {
    throw new ValidationError('Invalid email format', 'email');
  }

  if (!isStrongPassword(password)) {
    throw new ValidationError('Password too weak', 'password');
  }

  return { email, password, username };
};
```

### SQL Injection Prevention

```typescript
// Good - Use parameterized queries
const user = await User.findOne({
  where: { email: userEmail }
});

// Bad - String concatenation
const user = await sequelize.query(
  `SELECT * FROM users WHERE email = '${userEmail}'`
);
```

### XSS Prevention

```typescript
// Good - Sanitize user input
import DOMPurify from 'isomorphic-dompurify';

const cleanBio = DOMPurify.sanitize(userInput.bio);

// Bad - Direct HTML rendering
<div dangerouslySetInnerHTML={{ __html: userInput.bio }} />
```

### Authentication

```typescript
// Good - Secure password handling
import bcrypt from 'bcrypt';

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

## Performance Guidelines

### Frontend Performance

#### Lazy Loading
```typescript
// Good
const LazyComponent = lazy(() => import('./HeavyComponent'));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazyComponent />
  </Suspense>
);
```

#### Image Optimization
```typescript
// Good
<OptimizedImage
  src="/images/profile.jpg"
  alt="User profile"
  width={300}
  height={300}
  quality="medium"
  priority={isAboveTheFold}
/>

// Bad
<img src="/images/profile.jpg" alt="User profile" />
```

### Backend Performance

#### Database Indexing
```typescript
// Good - Add indexes for frequently queried fields
@Table({
  indexes: [
    { fields: ['email'] },
    { fields: ['createdAt'] },
    { fields: ['isActive', 'role'] }
  ]
})
export class User extends Model<User> { ... }
```

#### Caching
```typescript
// Good - Use Redis for caching
import Redis from 'ioredis';

const redis = new Redis();

const getUser = async (id: string): Promise<User | null> => {
  const cacheKey = `user:${id}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }

  const user = await User.findByPk(id);
  if (user) {
    await redis.setex(cacheKey, 3600, JSON.stringify(user));
  }

  return user;
};
```

## Testing Guidelines

### Test Structure

```typescript
// Good - AAA Pattern (Arrange, Act, Assert)
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      };

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(result.password).not.toBe(userData.password); // Should be hashed
    });
  });
});
```

### Mocking

```typescript
// Good - Mock external dependencies
jest.mock('../services/emailService');
const mockEmailService = emailService as jest.Mocked<typeof emailService>;

beforeEach(() => {
  jest.clearAllMocks();
  mockEmailService.sendEmail.mockResolvedValue({ messageId: 'test-id' });
});
```

### Test Coverage

- **Minimum Coverage**: 80% line coverage, 80% branch coverage
- **Critical Paths**: 100% coverage for authentication, payment, and security features
- **Test Types**: Unit tests, integration tests, and end-to-end tests

## Git Guidelines

### Commit Messages

Follow Conventional Commits format:

```
<type>: <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat: add user registration with email verification
fix: resolve login timeout issue
docs: update API documentation
refactor: improve error handling in auth middleware
```

### Branch Naming

- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical fixes
- `docs/documentation-update` - Documentation
- `refactor/code-improvement` - Code refactoring

### Pull Request Guidelines

#### PR Requirements
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] No security vulnerabilities
- [ ] Performance impact considered
- [ ] Documentation updated if needed

#### PR Template
```markdown
## Summary
Brief description of changes

## Test plan
- [ ] Test case 1
- [ ] Test case 2
- [ ] Edge case testing

## Documentation
- [ ] Code comments added
- [ ] Documentation updated
- [ ] API docs updated

## Screenshots (if applicable)
```

## Documentation Guidelines

### Code Comments

#### When to Comment
- Complex algorithms or business logic
- Non-obvious code decisions
- External API integrations
- Performance-critical code

#### Comment Style
```typescript
/**
 * Calculate user compatibility score based on preferences and interests
 * 
 * @param user1 - First user object
 * @param user2 - Second user object
 * @returns Compatibility score (0-100)
 */
const calculateCompatibility = (user1: User, user2: User): number => {
  // Implementation details
  // This algorithm considers:
  // - Age range overlap
  // - Interest similarity
  // - Location proximity
  // - Lifestyle compatibility
  
  const ageScore = calculateAgeCompatibility(user1, user2);
  const interestScore = calculateInterestCompatibility(user1, user2);
  const locationScore = calculateLocationCompatibility(user1, user2);
  
  return (ageScore * 0.3) + (interestScore * 0.4) + (locationScore * 0.3);
};
```

### API Documentation

#### JSDoc Comments
```typescript
/**
 * Authenticate user login
 * 
 * @async
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User email address
 * @param {string} credentials.password - User password
 * @param {boolean} [credentials.rememberMe=false] - Remember session flag
 * @returns {Promise<Session>} Created session object
 * @throws {ValidationError} When validation fails
 * @throws {AuthenticationError} When credentials are invalid
 * 
 * @example
 * const session = await authService.login({
 *   email: 'user@example.com',
 *   password: 'password123',
 *   rememberMe: true
 * });
 */
async login(credentials: LoginCredentials): Promise<Session> {
  // Implementation
}
```

### README Files

Every major component should have a README:

```markdown
# Component Name

Brief description of what this component does.

## Features

- Feature 1
- Feature 2
- Feature 3

## Usage

```typescript
// Example usage
```

## Configuration

Environment variables and configuration options.

## Testing

How to run tests for this component.

## Dependencies

List of dependencies and their purposes.
```

## Code Review Checklist

### Before Submitting

- [ ] Code follows all style guidelines
- [ ] All tests pass
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] Security best practices followed
- [ ] Performance considerations addressed
- [ ] Documentation updated

### During Review

- [ ] Code is readable and maintainable
- [ ] Logic is correct and handles edge cases
- [ ] No security vulnerabilities introduced
- [ ] Performance impact is acceptable
- [ ] Tests cover the changes
- [ ] Documentation is clear and accurate

### After Merge

- [ ] Monitor for any issues in staging/production
- [ ] Update any related documentation
- [ ] Consider follow-up improvements

By following these guidelines, we ensure our codebase remains maintainable, secure, and performant as the Sugar Daddy Platform continues to grow and evolve.