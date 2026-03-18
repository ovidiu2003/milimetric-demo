import { NextResponse } from 'next/server';
import textureManifest from '@/data/texture-manifest.json';

export async function GET() {
  return NextResponse.json({ textures: textureManifest });
}
