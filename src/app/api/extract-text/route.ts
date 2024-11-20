import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import path from 'path';
import { } from 'fs/promises';
import fs from 'fs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileUrl } = await req.json();

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'Missing file URL' },
        { status: 400 }
      );
    }


    const absolutePath = path.resolve(fileUrl);

    const exist = fs.existsSync(absolutePath);


    if (!exist) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const buffer = fs.readFileSync(absolutePath);



    if (buffer.length === 0) {
      throw new Error('Buffer is empty. Unable to parse PDF.');
    }

    const fileType = fileUrl.split('.').pop()?.toLowerCase();


    let extractedText = '';



    switch (fileType) {
      case 'pdf':
        const pdfData = await pdf(buffer);
        extractedText = pdfData.text;
        break;

      case 'docx':
        const result = await mammoth.extractRawText({ buffer: buffer });
        extractedText = result.value;
        break;

      case 'txt':
        extractedText = buffer.toString('utf-8');
        break;

      default:
        return NextResponse.json(
          { error: 'Unsupported file type' },
          { status: 400 }
        );
    }


    return NextResponse.json({ text: extractedText });
  } catch (error) {
    console.error('Error extracting text:', error);
    return NextResponse.json(
      { error: 'Failed to extract text from document' },
      { status: 500 }
    );
  }
}
