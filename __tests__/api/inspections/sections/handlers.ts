import { NextApiRequest, NextApiResponse } from 'next';
import { InspectionSection } from './types';

/**
 * Handles GET requests to fetch inspection sections.
 * Returns a list of sections for the specified inspection.
 * 
 * @param req - Next.js API request object
 * @param req.query.inspectionId - ID of the inspection to fetch sections for
 * @param res - Next.js API response object
 * @returns {Promise<void>} Resolves when response is sent
 * 
 * @example
 * // GET /api/inspections/{inspectionId}/sections
 * // Returns: Section[]
 */
export async function handleGetSections(req: NextApiRequest, res: NextApiResponse) {
  const { inspectionId } = req.query;
  const sections = (req as any)._mockData?.sections || [];
  res.status(200).json(sections);
}

/**
 * Handles POST requests to create a new inspection section.
 * Validates required fields and creates a new section.
 * 
 * @param req - Next.js API request object
 * @param req.query.inspectionId - ID of the inspection to create section in
 * @param req.body - Section data to create
 * @param req.body.title - Title of the section (required)
 * @param req.body.description - Description of the section
 * @param req.body.order - Order of the section
 * @param res - Next.js API response object
 * @returns {Promise<void>} Resolves when response is sent
 * 
 * @example
 * // POST /api/inspections/{inspectionId}/sections
 * // Body: { title: string, description?: string, order?: number }
 * // Returns: Section
 */
export async function handlePostSection(req: NextApiRequest, res: NextApiResponse) {
  const { inspectionId } = req.query;
  const section = req.body as Partial<InspectionSection>;
  
  if (!section.title || section.title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newSection: InspectionSection = {
    id: `section-${Date.now()}`,
    inspectionId: inspectionId as string,
    title: section.title,
    description: section.description || '',
    order: section.order || 1,
    metadata: section.metadata || {},
    customFields: section.customFields || {},
    content: section.content || '',
    completedBy: section.completedBy || null,
    completedAt: section.completedAt || null,
    isCompleted: section.isCompleted || false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const sections = (req as any)._mockData?.sections || [];
  sections.push(newSection);
  res.status(201).json(newSection);
}

/**
 * Handles PUT requests to update an existing inspection section.
 * Validates input and updates the specified section.
 * 
 * @param req - Next.js API request object
 * @param req.query.inspectionId - ID of the inspection containing the section
 * @param req.query.sectionId - ID of the section to update
 * @param req.body - Section data to update
 * @param res - Next.js API response object
 * @returns {Promise<void>} Resolves when response is sent
 * 
 * @example
 * // PUT /api/inspections/{inspectionId}/sections/{sectionId}
 * // Body: Partial<Section>
 * // Returns: Section
 */
export async function handlePutSection(req: NextApiRequest, res: NextApiResponse) {
  const { inspectionId, sectionId } = req.query;
  const updates = req.body as Partial<InspectionSection>;
  
  const sections = (req as any)._mockData?.sections || [];
  const sectionIndex = sections.findIndex((s: InspectionSection) => s.id === sectionId);
  
  if (sectionIndex === -1) {
    return res.status(404).json({ error: 'Section not found' });
  }

  // Validate updates
  if (updates.title === '') {
    return res.status(400).json({ error: 'Title cannot be empty' });
  }
  if (updates.order !== undefined && updates.order < 0) {
    return res.status(400).json({ error: 'Order must be non-negative' });
  }
  if (updates.metadata !== undefined && typeof updates.metadata !== 'object') {
    return res.status(400).json({ error: 'Invalid metadata format' });
  }

  const updatedSection = {
    ...sections[sectionIndex],
    ...updates,
    updatedAt: new Date()
  };

  sections[sectionIndex] = updatedSection;
  res.status(200).json(updatedSection);
}

/**
 * Handles DELETE requests to remove an inspection section.
 * Deletes the specified section if it exists.
 * 
 * @param req - Next.js API request object
 * @param req.query.inspectionId - ID of the inspection containing the section
 * @param req.query.sectionId - ID of the section to delete
 * @param res - Next.js API response object
 * @returns {Promise<void>} Resolves when response is sent
 * 
 * @example
 * // DELETE /api/inspections/{inspectionId}/sections/{sectionId}
 * // Returns: { success: true }
 */
export async function handleDeleteSection(req: NextApiRequest, res: NextApiResponse) {
  const { inspectionId, sectionId } = req.query;
  const sections = (req as any)._mockData?.sections || [];
  
  const sectionIndex = sections.findIndex((s: InspectionSection) => s.id === sectionId);
  if (sectionIndex === -1) {
    return res.status(404).json({ error: 'Section not found' });
  }

  sections.splice(sectionIndex, 1);
  res.status(200).json({ success: true });
}
