import { annotationLinkService, AnnotationLinkError } from '../../app/services/annotationLinkService';
import { prisma } from '../../app/lib/prisma';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import {
  LinkType,
  LinkDirection,
  LinkStatus,
  UpdatePropagation,
  AnnotationLink
} from '../../app/types/annotationLink';
import { AnnotationType } from '../../app/types/annotation';

// Mock Prisma
jest.mock('../../app/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>()
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('Annotation Link Service', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  const mockSourceAnnotation = {
    id: 'source-1',
    type: AnnotationType.TEXT,
    mapId: 'map-1'
  };

  const mockTargetAnnotation = {
    id: 'target-1',
    type: AnnotationType.MEASUREMENT,
    mapId: 'map-1'
  };

  describe('createLink', () => {
    it('should create a link between annotations', async () => {
      prismaMock.annotation.findUnique.mockImplementation(async ({ where }) => {
        if (where.id === 'source-1') return mockSourceAnnotation;
        if (where.id === 'target-1') return mockTargetAnnotation;
        return null;
      });

      prismaMock.annotationLink.create.mockResolvedValue({
        id: 'link-1',
        sourceId: 'source-1',
        targetId: 'target-1',
        type: LinkType.REFERENCE,
        direction: LinkDirection.UNIDIRECTIONAL,
        status: LinkStatus.ACTIVE,
        propagation: UpdatePropagation.NONE,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await annotationLinkService.createLink(
        'source-1',
        'target-1',
        LinkType.REFERENCE
      );

      expect(result.id).toBeDefined();
      expect(result.sourceId).toBe('source-1');
      expect(result.targetId).toBe('target-1');
      expect(result.type).toBe(LinkType.REFERENCE);
      expect(result.status).toBe(LinkStatus.ACTIVE);
    });

    it('should reject link creation for non-existent annotations', async () => {
      prismaMock.annotation.findUnique.mockResolvedValue(null);

      await expect(annotationLinkService.createLink(
        'non-existent',
        'target-1',
        LinkType.REFERENCE
      )).rejects.toThrow(AnnotationLinkError);
    });

    it('should create link with custom options', async () => {
      prismaMock.annotation.findUnique.mockImplementation(async ({ where }) => {
        if (where.id === 'source-1') return mockSourceAnnotation;
        if (where.id === 'target-1') return mockTargetAnnotation;
        return null;
      });

      const options = {
        direction: LinkDirection.BIDIRECTIONAL,
        propagation: UpdatePropagation.BOTH,
        metadata: {
          description: 'Test link',
          priority: 1
        }
      };

      prismaMock.annotationLink.create.mockResolvedValue({
        id: 'link-1',
        sourceId: 'source-1',
        targetId: 'target-1',
        type: LinkType.REFERENCE,
        ...options,
        status: LinkStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await annotationLinkService.createLink(
        'source-1',
        'target-1',
        LinkType.REFERENCE,
        options
      );

      expect(result.direction).toBe(LinkDirection.BIDIRECTIONAL);
      expect(result.propagation).toBe(UpdatePropagation.BOTH);
      expect(result.metadata).toEqual(options.metadata);
    });
  });

  describe('updateLink', () => {
    const mockLink: AnnotationLink = {
      id: 'link-1',
      sourceId: 'source-1',
      targetId: 'target-1',
      type: LinkType.REFERENCE,
      direction: LinkDirection.UNIDIRECTIONAL,
      status: LinkStatus.ACTIVE,
      propagation: UpdatePropagation.NONE,
      createdBy: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should update link properties', async () => {
      prismaMock.annotationLink.findUnique.mockResolvedValue(mockLink);
      prismaMock.annotationLink.update.mockResolvedValue({
        ...mockLink,
        status: LinkStatus.ARCHIVED,
        updatedAt: new Date()
      });

      const result = await annotationLinkService.updateLink(
        'link-1',
        { status: LinkStatus.ARCHIVED },
        'user-1'
      );

      expect(result.success).toBe(true);
      expect(result.linkId).toBe('link-1');
      expect(result.validationResults.isValid).toBe(true);
    });

    it('should reject update for non-existent link', async () => {
      prismaMock.annotationLink.findUnique.mockResolvedValue(null);

      await expect(annotationLinkService.updateLink(
        'non-existent',
        { status: LinkStatus.ARCHIVED },
        'user-1'
      )).rejects.toThrow(AnnotationLinkError);
    });
  });

  describe('upsertGroup', () => {
    const mockLinks = [
      {
        id: 'link-1',
        type: LinkType.REFERENCE
      },
      {
        id: 'link-2',
        type: LinkType.REFERENCE
      }
    ];

    it('should create new link group', async () => {
      prismaMock.annotationLink.findMany.mockResolvedValue(mockLinks);
      prismaMock.linkGroup.upsert.mockResolvedValue({
        id: 'group-1',
        name: 'Test Group',
        links: ['link-1', 'link-2'],
        type: LinkType.REFERENCE,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await annotationLinkService.upsertGroup(
        'Test Group',
        ['link-1', 'link-2'],
        LinkType.REFERENCE
      );

      expect(result.id).toBeDefined();
      expect(result.name).toBe('Test Group');
      expect(result.links).toHaveLength(2);
    });

    it('should reject group with non-existent links', async () => {
      prismaMock.annotationLink.findMany.mockResolvedValue([mockLinks[0]]);

      await expect(annotationLinkService.upsertGroup(
        'Test Group',
        ['link-1', 'non-existent'],
        LinkType.REFERENCE
      )).rejects.toThrow(AnnotationLinkError);
    });

    it('should reject group with mixed link types', async () => {
      prismaMock.annotationLink.findMany.mockResolvedValue([
        { id: 'link-1', type: LinkType.REFERENCE },
        { id: 'link-2', type: LinkType.DEPENDENCY }
      ]);

      await expect(annotationLinkService.upsertGroup(
        'Test Group',
        ['link-1', 'link-2'],
        LinkType.REFERENCE
      )).rejects.toThrow(AnnotationLinkError);
    });
  });

  describe('getStatistics', () => {
    it('should return link statistics', async () => {
      const mockLinks = [
        {
          id: 'link-1',
          type: LinkType.REFERENCE,
          direction: LinkDirection.UNIDIRECTIONAL,
          status: LinkStatus.ACTIVE
        },
        {
          id: 'link-2',
          type: LinkType.DEPENDENCY,
          direction: LinkDirection.BIDIRECTIONAL,
          status: LinkStatus.ACTIVE
        }
      ];

      prismaMock.annotationLink.findMany.mockResolvedValue(mockLinks);

      const stats = await annotationLinkService.getStatistics();

      expect(stats.total).toBe(2);
      expect(stats.byType[LinkType.REFERENCE]).toBe(1);
      expect(stats.byType[LinkType.DEPENDENCY]).toBe(1);
      expect(stats.byDirection[LinkDirection.UNIDIRECTIONAL]).toBe(1);
      expect(stats.byDirection[LinkDirection.BIDIRECTIONAL]).toBe(1);
    });

    it('should handle empty result set', async () => {
      prismaMock.annotationLink.findMany.mockResolvedValue([]);

      const stats = await annotationLinkService.getStatistics();

      expect(stats.total).toBe(0);
      expect(stats.validationStatus.valid).toBe(0);
      expect(stats.errorRate).toBe(0);
    });
  });

  describe('buildGraph', () => {
    it('should build link graph', async () => {
      const mockLinks = [
        {
          id: 'link-1',
          sourceId: 'anno-1',
          targetId: 'anno-2',
          type: LinkType.REFERENCE
        },
        {
          id: 'link-2',
          sourceId: 'anno-2',
          targetId: 'anno-3',
          type: LinkType.REFERENCE
        }
      ];

      prismaMock.annotationLink.findMany.mockResolvedValue(mockLinks);

      const graph = await annotationLinkService.buildGraph('anno-1');

      expect(graph.nodes).toBeDefined();
      expect(graph.cycles).toBeDefined();
      expect(graph.roots).toContain('anno-1');
      expect(graph.leaves).toContain('anno-3');
      expect(graph.metadata?.depth).toBeGreaterThan(0);
    });

    it('should handle cyclic references', async () => {
      const mockLinks = [
        {
          id: 'link-1',
          sourceId: 'anno-1',
          targetId: 'anno-2',
          type: LinkType.REFERENCE
        },
        {
          id: 'link-2',
          sourceId: 'anno-2',
          targetId: 'anno-1',
          type: LinkType.REFERENCE
        }
      ];

      prismaMock.annotationLink.findMany.mockResolvedValue(mockLinks);

      const graph = await annotationLinkService.buildGraph('anno-1');

      expect(graph.cycles).toHaveLength(1);
      expect(graph.cycles[0]).toContain('anno-1');
      expect(graph.cycles[0]).toContain('anno-2');
    });
  });
});
