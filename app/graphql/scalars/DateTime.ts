import { GraphQLScalarType, Kind } from 'graphql';

export const DateTimeResolver = new GraphQLScalarType<Date | null, string | number>({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  
  serialize(value: unknown): string | number {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }
    throw new Error('DateTime cannot represent an invalid date value');
  },
  
  parseValue(value: unknown): Date | null {
    if (value === null) {
      return null;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid DateTime');
      }
      return date;
    }
    throw new Error('DateTime must be a string or number');
  },
  
  parseLiteral(ast): Date | null {
    if (ast.kind === Kind.STRING) {
      const date = new Date(ast.value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid DateTime');
      }
      return date;
    }
    if (ast.kind === Kind.INT) {
      const date = new Date(parseInt(ast.value, 10));
      if (isNaN(date.getTime())) {
        throw new Error('Invalid DateTime');
      }
      return date;
    }
    return null;
  },
}); 
