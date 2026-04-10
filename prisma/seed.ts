import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // 🔐 create user
    const hashedPassword = await bcrypt.hash('123456', 10)

    const user = await prisma.user.create({
        data: {
            name: 'Test User',
            email: 'test@mail.com',
            password: hashedPassword,
            phone: '08123456789',
            isShownPhone: true,
        },
    })

    // 📂 categories
    const elektronik = await prisma.category.create({
        data: {
            name: 'Elektronik',
            slug: 'elektronik',
        },
    })

    const kendaraan = await prisma.category.create({
        data: {
            name: 'Kendaraan',
            slug: 'kendaraan',
        },
    })

    // 📍 location (optional kalau ada di schema kamu)
    const location = await prisma.location.create({
        data: {
            province: 'Jawa Barat',
            city: 'Bandung',
            district: 'Cimahi',
            latitude: -6.9,
            longitude: 107.6,
        },
    })

    // 📦 listing 1
    const listing = await prisma.listing.create({
        data: {
            title: 'Motor Vario 110 Bekas',
            description: 'Mesin halus, surat lengkap, siap pakai',
            price: 8500000,

            userId: user.id,
            categoryId: kendaraan.id,
            locationId: location.id,

            images: {
                create: [
                    {
                        url: 'https://picsum.photos/600/400?1',
                        isPrimary: true,
                    },
                    {
                        url: 'https://picsum.photos/600/400?2',
                    },
                ],
            },
        },
    })

    const listing2 = await prisma.listing.create({
        data: {
            title: 'Laptop Gaming i7 RTX',
            description: 'Masih kencang, cocok gaming & kerja',
            price: 12000000,

            userId: user.id,
            categoryId: elektronik.id,
            locationId: location.id,

            images: {
                create: [
                    {
                        url: 'https://picsum.photos/600/400?3',
                        isPrimary: true,
                    },
                ],
            },
        },
    })

    console.log('✅ Seeding selesai')
    console.log({ user, listing, listing2 })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })