// REPL context file - import and export project resources
// to import, use const { prisma, getUsers, getPoems } = await import("./repl-context.js");
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Initialize environment
dotenv.config();

// Create clients
export const prisma = new PrismaClient();

// Functions to expose
export async function getUsers() {
  return await prisma.user.findMany();
}

export async function getPoems() {
  return await prisma.poem.findMany();
}

// When imported in REPL, this will print
console.log('🚀 Project context loaded!');
console.log('');
console.log('Available exports:');
console.log('- prisma: PrismaClient instance');
console.log('- getUsers(): Function to fetch all users');
console.log('- getPoems(): Function to fetch all poems');
console.log('');
console.log('Example: await getUsers()');
