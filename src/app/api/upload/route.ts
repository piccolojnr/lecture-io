import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('files') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const fileName = `${Date.now()}-${file.name}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);



    return NextResponse.json({
      message: 'File uploaded successfully',
      url: filePath
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}
