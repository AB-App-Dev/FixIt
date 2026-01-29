import { prisma } from '../../utils/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

async function verifyRecaptcha(token: string, secretKey: string): Promise<boolean> {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${secretKey}&response=${token}`,
  })

  const data = await response.json()
  return data.success && data.score >= 0.5
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const formData = await readMultipartFormData(event)

  if (!formData) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ungültige Anfrage.',
    })
  }

  const fields: Record<string, string> = {}
  let imageFile: { filename: string; data: Buffer; type: string } | null = null

  for (const item of formData) {
    if (item.name === 'image' && item.data) {
      imageFile = {
        filename: item.filename || 'image.jpg',
        data: item.data,
        type: item.type || 'image/jpeg',
      }
    } else if (item.name && item.data) {
      fields[item.name] = item.data.toString('utf-8')
    }
  }

  // Verify reCAPTCHA token
  if (!fields.recaptchaToken) {
    throw createError({
      statusCode: 400,
      statusMessage: 'reCAPTCHA-Token fehlt.',
    })
  }

  const isValidRecaptcha = await verifyRecaptcha(fields.recaptchaToken, config.recaptchaSecretKey)
  if (!isValidRecaptcha) {
    throw createError({
      statusCode: 400,
      statusMessage: 'reCAPTCHA-Überprüfung fehlgeschlagen. Bitte versuchen Sie es erneut.',
    })
  }

  if (!fields.title || !fields.description || !fields.location || !imageFile) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Alle Pflichtfelder müssen ausgefüllt sein.',
    })
  }

  if (fields.title.length > 200) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Der Titel darf maximal 200 Zeichen lang sein.',
    })
  }

  const uploadsDir = join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadsDir, { recursive: true })

  const ext = imageFile.filename.split('.').pop()?.toLowerCase() || 'jpg'
  const uniqueFilename = `${randomUUID()}.${ext}`
  const filePath = join(uploadsDir, uniqueFilename)

  await writeFile(filePath, imageFile.data)

  const imageUrl = `/uploads/${uniqueFilename}`

  const incident = await prisma.incident.create({
    data: {
      title: fields.title,
      description: fields.description,
      location: fields.location,
      imageUrl,
      wantsContact: fields.wantsContact === 'true',
      phoneNumber: fields.wantsContact === 'true' && fields.phoneNumber ? fields.phoneNumber : null,
    },
  })

  return incident
})
