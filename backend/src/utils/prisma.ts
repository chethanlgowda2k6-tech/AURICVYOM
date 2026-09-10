import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = `${process.env.DATABASE_URL}`

const pool = new Pool({
  connectionString,
  max: 5,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 10000,
})

pool.on('error', (err) => {
  // Suppress uncaught disconnect exceptions on idle connections
  console.warn('[Prisma Pool Notice]:', err?.message);
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export default prisma

