import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, unlink } from 'fs/promises';
import path from 'path';
import { validateTemplate } from '../../../utils/formTemplates';

// Directory for storing templates
const TEMPLATES_DIR = path.join(process.cwd(), 'public', 'templates');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate the template
    const buffer = Buffer.from(await file.arrayBuffer());
    const validation = await validateTemplate(file);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(TEMPLATES_DIR, filename);

    // Ensure templates directory exists
    await writeFile(filepath, buffer);

    return NextResponse.json({
      message: 'Template uploaded successfully',
      filename
    });
  } catch (error) {
    console.error('Template upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload template' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const filename = url.searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      );
    }

    const filepath = path.join(TEMPLATES_DIR, filename);
    const file = await readFile(filepath);

    // Set appropriate content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const contentType = ext === '.pdf' 
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Template download error:', error);
    return NextResponse.json(
      { error: 'Failed to download template' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const filename = url.searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      );
    }

    const filepath = path.join(TEMPLATES_DIR, filename);
    await unlink(filepath);

    return NextResponse.json({
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Template deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}

// Helper function to ensure templates directory exists
async function ensureTemplatesDir() {
  try {
    await writeFile(TEMPLATES_DIR, '');
  } catch (error) {
    // Directory already exists
  }
}
