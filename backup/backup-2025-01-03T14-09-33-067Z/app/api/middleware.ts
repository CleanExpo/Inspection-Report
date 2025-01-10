import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]/route';

export async function withAuth(
  handler: (req: Request) => Promise<NextResponse>,
  req: Request
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  return handler(req);
}

export async function validateTemplate(data: any) {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Template name is required');
  }

  if (!data.category || !['Commercial', 'Residential'].includes(data.category)) {
    errors.push('Valid category (Commercial or Residential) is required');
  }

  if (!Array.isArray(data.sections) || data.sections.length === 0) {
    errors.push('At least one section is required');
  } else {
    data.sections.forEach((section: any, sectionIndex: number) => {
      if (!section.title?.trim()) {
        errors.push(`Section ${sectionIndex + 1}: Title is required`);
      }

      if (!Array.isArray(section.fields)) {
        errors.push(`Section ${sectionIndex + 1}: Fields must be an array`);
      } else {
        section.fields.forEach((field: any, fieldIndex: number) => {
          if (!field.label?.trim()) {
            errors.push(
              `Section ${sectionIndex + 1}, Field ${fieldIndex + 1}: Label is required`
            );
          }

          if (!field.type?.trim()) {
            errors.push(
              `Section ${sectionIndex + 1}, Field ${fieldIndex + 1}: Type is required`
            );
          }

          if (
            ['select', 'multiselect'].includes(field.type) &&
            (!Array.isArray(field.options) || field.options.length === 0)
          ) {
            errors.push(
              `Section ${sectionIndex + 1}, Field ${fieldIndex + 1}: Options are required for select/multiselect fields`
            );
          }

          if (field.validationRules) {
            if (!Array.isArray(field.validationRules)) {
              errors.push(
                `Section ${sectionIndex + 1}, Field ${fieldIndex + 1}: Validation rules must be an array`
              );
            } else {
              field.validationRules.forEach((rule: any, ruleIndex: number) => {
                if (!rule.type?.trim()) {
                  errors.push(
                    `Section ${sectionIndex + 1}, Field ${fieldIndex + 1}, Rule ${
                      ruleIndex + 1
                    }: Type is required`
                  );
                }
                if (!rule.value?.trim()) {
                  errors.push(
                    `Section ${sectionIndex + 1}, Field ${fieldIndex + 1}, Rule ${
                      ruleIndex + 1
                    }: Value is required`
                  );
                }
                if (!rule.message?.trim()) {
                  errors.push(
                    `Section ${sectionIndex + 1}, Field ${fieldIndex + 1}, Rule ${
                      ruleIndex + 1
                    }: Message is required`
                  );
                }
              });
            }
          }
        });
      }
    });
  }

  return errors;
}
