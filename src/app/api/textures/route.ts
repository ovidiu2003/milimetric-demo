import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const texturesDir = path.join(process.cwd(), 'public', 'textures');

  try {
    const files = fs.readdirSync(texturesDir);
    const imageFiles = files.filter((f) =>
      /\.(jpg|jpeg|png|webp)$/i.test(f)
    );
    return NextResponse.json({ textures: imageFiles });
  } catch {
    return NextResponse.json({ textures: [] });
  }
}
