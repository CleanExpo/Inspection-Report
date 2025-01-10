import { prisma } from '../lib/prisma';
import {
  AnnotationType,
  ShapeType,
  MeasurementType,
  Annotation,
  TextAnnotation,
  ShapeAnnotation,
  MeasurementAnnotation,
  ImageAnnotation,
  AnnotationLayer,
  AnnotationGroup,
  AnnotationVersion,
  AnnotationExport,
  AnnotationTemplate,
  AnnotationStatistics,
  AnnotationValidationRule,
  AnnotationTransform,
  AnnotationSnappingOptions
} from '../types/annotation';
import { Point } from '../types/moisture';
import { createHistoryEntry } from '../utils/historyTracking';
import { EntityType, ChangeType } from '../types/history';

export class AnnotationServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnnotationServiceError';
  }
}

export class AnnotationService {
  /**
   * Creates a new annotation
   */
  async createAnnotation<T extends Annotation>(
    mapId: string,
    type: AnnotationType,
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<T> {
    try {
      // Validate annotation data
      this.validateAnnotation(type, data);

      // Create annotation
      const annotation = await prisma.annotation.create({
        data: {
          ...data,
          mapId,
          type
        }
      });

      // Create history entry
      await createHistoryEntry(
        annotation.id,
        EntityType.ANNOTATION,
        ChangeType.CREATE,
        data.createdBy,
        null,
        annotation
      );

      return annotation as T;
    } catch (error) {
      throw new AnnotationServiceError(`Failed to create annotation: ${error.message}`);
    }
  }

  /**
   * Updates an existing annotation
   */
  async updateAnnotation<T extends Annotation>(
    id: string,
    data: Partial<T>,
    userId: string
  ): Promise<T> {
    try {
      // Get current annotation
      const current = await prisma.annotation.findUnique({
        where: { id }
      });

      if (!current) {
        throw new AnnotationServiceError('Annotation not found');
      }

      // Validate update data
      this.validateAnnotationUpdate(current.type as AnnotationType, data);

      // Create version of current state
      await this.createAnnotationVersion(current, userId);

      // Update annotation
      const updated = await prisma.annotation.update({
        where: { id },
        data
      });

      // Create history entry
      await createHistoryEntry(
        id,
        EntityType.ANNOTATION,
        ChangeType.UPDATE,
        userId,
        current,
        updated
      );

      return updated as T;
    } catch (error) {
      throw new AnnotationServiceError(`Failed to update annotation: ${error.message}`);
    }
  }

  /**
   * Creates or updates an annotation layer
   */
  async upsertLayer(
    mapId: string,
    layer: Omit<AnnotationLayer, 'id' | 'annotations'>
  ): Promise<AnnotationLayer> {
    try {
      // Validate layer data
      this.validateLayer(layer);

      // Create or update layer
      const result = await prisma.annotationLayer.upsert({
        where: {
          mapId_name: {
            mapId,
            name: layer.name
          }
        },
        create: {
          ...layer,
          mapId,
          annotations: []
        },
        update: {
          ...layer
        }
      });

      return result as AnnotationLayer;
    } catch (error) {
      throw new AnnotationServiceError(`Failed to upsert layer: ${error.message}`);
    }
  }

  /**
   * Creates or updates an annotation group
   */
  async upsertGroup(
    mapId: string,
    group: Omit<AnnotationGroup, 'id'>
  ): Promise<AnnotationGroup> {
    try {
      // Validate group data
      this.validateGroup(group);

      // Create or update group
      const result = await prisma.annotationGroup.upsert({
        where: {
          mapId_name: {
            mapId,
            name: group.name
          }
        },
        create: {
          ...group,
          mapId
        },
        update: {
          ...group
        }
      });

      return result as AnnotationGroup;
    } catch (error) {
      throw new AnnotationServiceError(`Failed to upsert group: ${error.message}`);
    }
  }

  /**
   * Applies a transform to annotations
   */
  async transformAnnotations(
    ids: string[],
    transform: AnnotationTransform,
    userId: string
  ): Promise<Annotation[]> {
    try {
      // Get annotations
      const annotations = await prisma.annotation.findMany({
        where: {
          id: { in: ids }
        }
      });

      // Apply transforms
      const transformed = annotations.map(annotation => 
        this.applyTransform(annotation as Annotation, transform)
      );

      // Update annotations
      const updated = await Promise.all(
        transformed.map(annotation =>
          this.updateAnnotation(
            annotation.id,
            annotation,
            userId
          )
        )
      );

      return updated;
    } catch (error) {
      throw new AnnotationServiceError(`Failed to transform annotations: ${error.message}`);
    }
  }

  /**
   * Gets annotation statistics
   */
  async getStatistics(mapId: string): Promise<AnnotationStatistics> {
    try {
      // Get all annotations for map
      const annotations = await prisma.annotation.findMany({
        where: { mapId }
      });

      // Calculate statistics
      return this.calculateStatistics(mapId, annotations as Annotation[]);
    } catch (error) {
      throw new AnnotationServiceError(`Failed to get statistics: ${error.message}`);
    }
  }

  /**
   * Exports annotations
   */
  async exportAnnotations(
    mapId: string,
    options: AnnotationExport
  ): Promise<Buffer> {
    try {
      // Get annotations to export
      const annotations = await prisma.annotation.findMany({
        where: {
          mapId,
          layer: options.options.layers
            ? { in: options.options.layers }
            : undefined
        }
      });

      // Generate export
      return this.generateExport(annotations as Annotation[], options);
    } catch (error) {
      throw new AnnotationServiceError(`Failed to export annotations: ${error.message}`);
    }
  }

  // Private helper methods

  private validateAnnotation(type: AnnotationType, data: any): void {
    // Implementation would validate annotation data based on type
  }

  private validateAnnotationUpdate(type: AnnotationType, data: any): void {
    // Implementation would validate update data based on type
  }

  private validateLayer(layer: Partial<AnnotationLayer>): void {
    // Implementation would validate layer data
  }

  private validateGroup(group: Partial<AnnotationGroup>): void {
    // Implementation would validate group data
  }

  private async createAnnotationVersion(
    annotation: any,
    userId: string
  ): Promise<AnnotationVersion> {
    // Implementation would create version record
    return {} as AnnotationVersion;
  }

  private applyTransform(
    annotation: Annotation,
    transform: AnnotationTransform
  ): Annotation {
    // Implementation would apply geometric transformations
    return annotation;
  }

  private calculateStatistics(
    mapId: string,
    annotations: Annotation[]
  ): AnnotationStatistics {
    // Implementation would calculate annotation statistics
    return {} as AnnotationStatistics;
  }

  private async generateExport(
    annotations: Annotation[],
    options: AnnotationExport
  ): Promise<Buffer> {
    // Implementation would generate export in requested format
    return Buffer.from('');
  }

  private getSnappingPoints(
    annotation: Annotation,
    options: AnnotationSnappingOptions
  ): Point[] {
    // Implementation would calculate snapping points
    return [];
  }

  private validateAnnotationRules(
    annotations: Annotation[],
    rules: AnnotationValidationRule[]
  ): { isValid: boolean; errors: string[] } {
    // Implementation would validate annotations against rules
    return { isValid: true, errors: [] };
  }
}

export const annotationService = new AnnotationService();
