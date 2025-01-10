import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { AuthorityForm, FormStatus } from '../../../../types/authority';
import { withAuth } from '../../../../utils/auth';

export const POST = withAuth(async (request: Request) => {
  try {
    const data = await request.json();
    const { jobId, formType, formData } = data;

    const form = await prisma.authorityForm.create({
      data: {
        jobId,
        formType,
        status: FormStatus.DRAFT,
        data: formData
      }
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error('Error saving form:', error);
    return NextResponse.json(
      { error: 'Failed to save form' },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (request: Request) => {
  try {
    const data = await request.json();
    const { id, formData, status } = data;

    const form = await prisma.authorityForm.update({
      where: { id },
      data: {
        data: formData,
        status,
        ...(status === FormStatus.SUBMITTED && {
          submittedAt: new Date(),
          submittedBy: 'user' // In real app, get from auth context
        })
      }
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json(
      { error: 'Failed to update form' },
      { status: 500 }
    );
  }
});
