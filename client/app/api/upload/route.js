import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate mime type
    const validMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/avif'
    ];

    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only image files (JPG, PNG, WebP, GIF, SVG) are allowed.' },
        { status: 400 }
      );
    }

    // Generate safe filename
    const ext = path.extname(file.name) || `.${file.type.split('/')[1] || 'jpg'}`;
    const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileName = `${cleanBase}-${uniqueSuffix}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      size: file.size
    });
  } catch (error) {
    console.error('File upload failed:', error);
    return NextResponse.json(
      { error: 'Failed to process file upload: ' + error.message },
      { status: 500 }
    );
  }
}
