import { describe, expect, test, beforeEach } from '@jest/globals';
import { handleGetSections, handlePostSection, handlePutSection, handleDeleteSection } from './handlers';
import { validUuid } from './mocks';
import { setupTestContext, TestContext, validateSectionResponse, expectSuccessResponse, expectErrorResponse, createTestSections } from './test-utils';
import { InspectionSection } from './types';

describe('Inspection Sections API - Integration Tests', () => {
  let context: TestContext;
  const testInspectionId = validUuid;

  beforeEach(async () => {
    context = await setupTestContext({
      sections: []
    });
  });

  describe('Complete Workflow Tests', () => {
    test('should handle full CRUD lifecycle of a section', async () => {
      // 1. Create a new section
      const createPayload = {
        title: 'Test Section',
        description: 'Test Description',
        order: 1
      };

      let testContext = await setupTestContext({
        method: 'POST',
        query: { inspectionId: testInspectionId },
        body: createPayload
      });

      await handlePostSection(testContext.req, testContext.res);

      const createdSection = await expectSuccessResponse<InspectionSection>(testContext.res, 201, (data) => {
        validateSectionResponse(data, {
          ...createPayload,
          inspectionId: testInspectionId
        });
      });

      // 2. Retrieve the created section
      testContext = await setupTestContext({
        method: 'GET',
        query: { inspectionId: testInspectionId },
        sections: [createdSection]
      });

      await handleGetSections(testContext.req, testContext.res);

      await expectSuccessResponse<InspectionSection[]>(testContext.res, 200, (data) => {
        expect(data).toHaveLength(1);
        expect(data[0].id).toBe(createdSection.id);
      });

      // 3. Update the section
      const updatePayload = {
        title: 'Updated Section',
        description: 'Updated Description'
      };

      testContext = await setupTestContext({
        method: 'PUT',
        query: { 
          inspectionId: testInspectionId,
          sectionId: createdSection.id
        },
        body: updatePayload,
        sections: [createdSection]
      });

      await handlePutSection(testContext.req, testContext.res);

      const updatedSection = await expectSuccessResponse<InspectionSection>(testContext.res, 200, (data) => {
        validateSectionResponse(data, {
          ...createdSection,
          ...updatePayload
        });
      });

      // 4. Delete the section
      testContext = await setupTestContext({
        method: 'DELETE',
        query: {
          inspectionId: testInspectionId,
          sectionId: updatedSection.id
        },
        sections: [updatedSection]
      });

      await handleDeleteSection(testContext.req, testContext.res);
      await expectSuccessResponse(testContext.res, 200);

      // 5. Verify deletion
      testContext = await setupTestContext({
        method: 'GET',
        query: { inspectionId: testInspectionId },
        sections: []
      });

      await handleGetSections(testContext.req, testContext.res);

      await expectSuccessResponse<InspectionSection[]>(testContext.res, 200, (data) => {
        expect(data).toHaveLength(0);
      });
    });

    test('should handle section reordering', async () => {
      // 1. Create multiple sections
      const sections = createTestSections(3, testInspectionId);
      sections[0].title = 'First Section';
      sections[1].title = 'Second Section';
      sections[2].title = 'Third Section';

      // 2. Reorder sections
      const reorderPayload = {
        order: 1  // Move the last section to the first position
      };

      let testContext = await setupTestContext({
        method: 'PUT',
        query: {
          inspectionId: testInspectionId,
          sectionId: sections[2].id
        },
        body: reorderPayload,
        sections
      });

      await handlePutSection(testContext.req, testContext.res);
      await expectSuccessResponse(testContext.res, 200);

      // 3. Verify new order
      testContext = await setupTestContext({
        method: 'GET',
        query: { inspectionId: testInspectionId },
        sections
      });

      await handleGetSections(testContext.req, testContext.res);

      await expectSuccessResponse<InspectionSection[]>(testContext.res, 200, (data) => {
        expect(data).toHaveLength(3);
        expect(data[0].id).toBe(sections[2].id);
        expect(data[1].id).toBe(sections[0].id);
        expect(data[2].id).toBe(sections[1].id);
      });
    });
  });

  describe('Data Consistency Tests', () => {
    test('should maintain data integrity across operations', async () => {
      // 1. Create a section with all possible fields
      const fullSection = {
        title: 'Complete Section',
        description: 'Detailed description',
        order: 1,
        metadata: {
          category: 'test',
          tags: ['integration', 'test']
        },
        customFields: {
          field1: 'value1',
          field2: 'value2'
        }
      };

      let testContext = await setupTestContext({
        method: 'POST',
        query: { inspectionId: testInspectionId },
        body: fullSection
      });

      await handlePostSection(testContext.req, testContext.res);
      const created = await expectSuccessResponse<InspectionSection>(testContext.res, 201);

      // 2. Verify all fields were saved correctly
      testContext = await setupTestContext({
        method: 'GET',
        query: { inspectionId: testInspectionId },
        sections: [created]
      });

      await handleGetSections(testContext.req, testContext.res);
      
      await expectSuccessResponse<InspectionSection[]>(testContext.res, 200, (data) => {
        const [retrieved] = data;
        validateSectionResponse(retrieved, {
          ...fullSection,
          id: created.id,
          inspectionId: testInspectionId
        });
      });

      // 3. Update specific fields and verify others remain unchanged
      const partialUpdate = {
        title: 'Updated Title',
        metadata: {
          ...fullSection.metadata,
          newField: 'newValue'
        }
      };

      testContext = await setupTestContext({
        method: 'PUT',
        query: {
          inspectionId: testInspectionId,
          sectionId: created.id
        },
        body: partialUpdate,
        sections: [created]
      });

      await handlePutSection(testContext.req, testContext.res);
      
      await expectSuccessResponse<InspectionSection>(testContext.res, 200, (data) => {
        validateSectionResponse(data, {
          ...created,
          ...partialUpdate
        });
      });
    });

    test('should handle concurrent operations correctly', async () => {
      // Create initial sections
      const sections = createTestSections(2, testInspectionId);

      // Simulate concurrent updates
      const updatePromises = sections.map(async (section) => {
        const testContext = await setupTestContext({
          method: 'PUT',
          query: {
            inspectionId: testInspectionId,
            sectionId: section.id
          },
          body: { title: `Updated ${section.id}` },
          sections
        });

        return handlePutSection(testContext.req, testContext.res);
      });

      await Promise.all(updatePromises);

      // Verify final state
      const testContext = await setupTestContext({
        method: 'GET',
        query: { inspectionId: testInspectionId },
        sections
      });

      await handleGetSections(testContext.req, testContext.res);
      
      await expectSuccessResponse<InspectionSection[]>(testContext.res, 200, (data) => {
        expect(data).toHaveLength(2);
        data.forEach((section, index) => {
          expect(section.title).toBe(`Updated ${sections[index].id}`);
        });
      });
    });
  });

  describe('Error Recovery Tests', () => {
    test('should handle failed operations gracefully', async () => {
      // 1. Create a section
      const section = createTestSections(1, testInspectionId)[0];

      // 2. Attempt invalid operations
      const invalidUpdates = [
        // Missing required field
        { body: { title: '' } },
        // Invalid order
        { body: { order: -1 } },
        // Invalid metadata
        { body: { metadata: 'invalid' } }
      ];

      for (const update of invalidUpdates) {
        const testContext = await setupTestContext({
          method: 'PUT',
          query: {
            inspectionId: testInspectionId,
            sectionId: section.id
          },
          body: update.body,
          sections: [section]
        });

        await handlePutSection(testContext.req, testContext.res);
        expectErrorResponse(testContext.res, 400);
      }

      // 3. Verify section remains unchanged
      const testContext = await setupTestContext({
        method: 'GET',
        query: { inspectionId: testInspectionId },
        sections: [section]
      });

      await handleGetSections(testContext.req, testContext.res);
      
      await expectSuccessResponse<InspectionSection[]>(testContext.res, 200, (data) => {
        const [retrievedSection] = data;
        validateSectionResponse(retrievedSection, {
          id: section.id,
          title: section.title,
          order: section.order,
          inspectionId: testInspectionId
        });
      });
    });
  });
});
