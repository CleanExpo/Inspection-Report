import { prisma } from '../lib/prisma';
import {
  LinkType,
  LinkDirection,
  LinkStatus,
  UpdatePropagation,
  AnnotationLink,
  LinkGroup,
  LinkDependency,
  LinkUpdateEvent,
  LinkValidationContext,
  LinkUpdateResult,
  LinkQueryOptions,
  LinkStatistics,
  LinkGraph,
  LinkValidationRule,
  LinkAuditEntry,
  LinkPermissions
} from '../types/annotationLink';
import { AnnotationType } from '../types/annotation';
import { createHistoryEntry } from '../utils/historyTracking';
import { EntityType, ChangeType } from '../types/history';

export class AnnotationLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnnotationLinkError';
  }
}

export class AnnotationLinkService {
  /**
   * Creates a new annotation link
   */
  async createLink(
    sourceId: string,
    targetId: string,
    type: LinkType,
    options: {
      direction?: LinkDirection;
      propagation?: UpdatePropagation;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<AnnotationLink> {
    try {
      // Validate source and target annotations exist
      const [source, target] = await Promise.all([
        prisma.annotation.findUnique({ where: { id: sourceId } }),
        prisma.annotation.findUnique({ where: { id: targetId } })
      ]);

      if (!source || !target) {
        throw new AnnotationLinkError('Source or target annotation not found');
      }

      // Validate link based on rules
      const validationContext: LinkValidationContext = {
        sourceAnnotation: {
          id: sourceId,
          type: source.type as AnnotationType
        },
        targetAnnotation: {
          id: targetId,
          type: target.type as AnnotationType
        },
        existingLinks: await this.getExistingLinks(sourceId, targetId),
        rules: await this.getValidationRules(type)
      };

      const validationResult = this.validateLink(validationContext);
      if (!validationResult.isValid) {
        throw new AnnotationLinkError(`Invalid link: ${validationResult.errors.join(', ')}`);
      }

      // Create link
      const link = await prisma.annotationLink.create({
        data: {
          sourceId,
          targetId,
          type,
          direction: options.direction || LinkDirection.UNIDIRECTIONAL,
          status: LinkStatus.ACTIVE,
          propagation: options.propagation || UpdatePropagation.NONE,
          metadata: options.metadata,
          validation: {
            lastValidated: new Date(),
            isValid: true,
            errors: []
          }
        }
      });

      // Create history entry
      await createHistoryEntry(
        link.id,
        EntityType.ANNOTATION_LINK,
        ChangeType.CREATE,
        'system',
        null,
        link
      );

      return link;
    } catch (error) {
      throw new AnnotationLinkError(`Failed to create link: ${error.message}`);
    }
  }

  /**
   * Updates an existing link
   */
  async updateLink(
    id: string,
    updates: Partial<AnnotationLink>,
    userId: string
  ): Promise<LinkUpdateResult> {
    try {
      // Get current link
      const current = await prisma.annotationLink.findUnique({
        where: { id }
      });

      if (!current) {
        throw new AnnotationLinkError('Link not found');
      }

      // Create update event
      const updateEvent = await this.createUpdateEvent(id, updates, userId);

      // Apply updates
      const updated = await prisma.annotationLink.update({
        where: { id },
        data: updates
      });

      // Propagate changes if needed
      const propagatedUpdates = await this.propagateUpdates(
        updated as AnnotationLink,
        updateEvent
      );

      // Validate updated link
      const validationResults = await this.validateLinkById(id);

      // Create history entry
      await createHistoryEntry(
        id,
        EntityType.ANNOTATION_LINK,
        ChangeType.UPDATE,
        userId,
        current,
        updated
      );

      return {
        success: true,
        linkId: id,
        propagatedUpdates,
        validationResults
      };
    } catch (error) {
      throw new AnnotationLinkError(`Failed to update link: ${error.message}`);
    }
  }

  /**
   * Creates or updates a link group
   */
  async upsertGroup(
    name: string,
    links: string[],
    type: LinkType,
    metadata?: Record<string, any>
  ): Promise<LinkGroup> {
    try {
      // Validate all links exist and are of the same type
      const existingLinks = await prisma.annotationLink.findMany({
        where: { id: { in: links } }
      });

      if (existingLinks.length !== links.length) {
        throw new AnnotationLinkError('One or more links not found');
      }

      if (!existingLinks.every(link => link.type === type)) {
        throw new AnnotationLinkError('All links must be of the same type');
      }

      // Create or update group
      const group = await prisma.linkGroup.upsert({
        where: { name },
        create: {
          name,
          links,
          type,
          metadata
        },
        update: {
          links,
          type,
          metadata
        }
      });

      return group as LinkGroup;
    } catch (error) {
      throw new AnnotationLinkError(`Failed to upsert group: ${error.message}`);
    }
  }

  /**
   * Gets link statistics
   */
  async getStatistics(options?: LinkQueryOptions): Promise<LinkStatistics> {
    try {
      // Get links based on query options
      const links = await prisma.annotationLink.findMany({
        where: this.buildQueryWhere(options)
      });

      // Calculate statistics
      return this.calculateStatistics(links as AnnotationLink[]);
    } catch (error) {
      throw new AnnotationLinkError(`Failed to get statistics: ${error.message}`);
    }
  }

  /**
   * Builds link graph
   */
  async buildGraph(
    startId: string,
    maxDepth: number = 3
  ): Promise<LinkGraph> {
    try {
      const graph: LinkGraph = {
        nodes: [],
        cycles: [],
        roots: [],
        leaves: [],
        metadata: {
          depth: 0,
          breadth: 0,
          density: 0
        }
      };

      // Build graph recursively
      await this.buildGraphRecursive(startId, graph, maxDepth);

      // Analyze graph
      this.analyzeGraph(graph);

      return graph;
    } catch (error) {
      throw new AnnotationLinkError(`Failed to build graph: ${error.message}`);
    }
  }

  // Private helper methods

  private async getExistingLinks(
    sourceId: string,
    targetId: string
  ): Promise<LinkValidationContext['existingLinks']> {
    const [fromSource, toTarget] = await Promise.all([
      prisma.annotationLink.findMany({
        where: { sourceId }
      }),
      prisma.annotationLink.findMany({
        where: { targetId }
      })
    ]);

    return {
      fromSource: fromSource as AnnotationLink[],
      toTarget: toTarget as AnnotationLink[]
    };
  }

  private async getValidationRules(type: LinkType): Promise<LinkValidationRule[]> {
    // Implementation would retrieve validation rules from configuration
    return [];
  }

  private validateLink(context: LinkValidationContext): {
    isValid: boolean;
    errors: string[];
  } {
    // Implementation would validate link against rules
    return { isValid: true, errors: [] };
  }

  private async validateLinkById(
    id: string
  ): Promise<{ isValid: boolean; errors: string[] }> {
    // Implementation would validate existing link
    return { isValid: true, errors: [] };
  }

  private async createUpdateEvent(
    linkId: string,
    updates: Partial<AnnotationLink>,
    userId: string
  ): Promise<LinkUpdateEvent> {
    // Implementation would create update event record
    return {} as LinkUpdateEvent;
  }

  private async propagateUpdates(
    link: AnnotationLink,
    event: LinkUpdateEvent
  ): Promise<LinkUpdateResult['propagatedUpdates']> {
    // Implementation would propagate updates to related links
    return [];
  }

  private buildQueryWhere(options?: LinkQueryOptions): any {
    // Implementation would build prisma where clause from options
    return {};
  }

  private calculateStatistics(links: AnnotationLink[]): LinkStatistics {
    // Implementation would calculate link statistics
    return {} as LinkStatistics;
  }

  private async buildGraphRecursive(
    nodeId: string,
    graph: LinkGraph,
    depth: number
  ): Promise<void> {
    // Implementation would build graph recursively
  }

  private analyzeGraph(graph: LinkGraph): void {
    // Implementation would analyze graph properties
  }

  private async createAuditEntry(
    linkId: string,
    action: LinkAuditEntry['action'],
    userId: string,
    changes?: LinkAuditEntry['changes']
  ): Promise<LinkAuditEntry> {
    // Implementation would create audit entry
    return {} as LinkAuditEntry;
  }

  private checkPermissions(
    userId: string,
    action: keyof LinkPermissions,
    link?: AnnotationLink
  ): boolean {
    // Implementation would check user permissions
    return true;
  }
}

export const annotationLinkService = new AnnotationLinkService();
