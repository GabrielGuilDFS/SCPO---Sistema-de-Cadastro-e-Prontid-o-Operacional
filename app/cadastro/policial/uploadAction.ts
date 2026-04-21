"use server"

import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

export async function uploadImage(formData: FormData) {
  const file = formData.get("file") as File
  if (!file) return { success: false, url: null }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const extension = file.name.split('.').pop()
    const fileName = `${randomUUID()}.${extension}`
    
    // Ensure public/uploads exists
    const uploadDir = join(process.cwd(), "public", "uploads")
    
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (e) {
      // Ignore directory exists error
    }

    const path = join(uploadDir, fileName)
    await writeFile(path, buffer)

    return { success: true, url: `/uploads/${fileName}` }
  } catch (error) {
    console.error("Erro ao salvar a imagem:", error)
    return { success: false, url: null }
  }
}
