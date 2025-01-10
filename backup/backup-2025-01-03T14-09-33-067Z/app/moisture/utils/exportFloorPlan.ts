import html2canvas from 'html2canvas';

interface Measurement {
  id: string;
  type: 'distance' | 'area';
  value: number;
  timestamp: Date;
  label?: string;
}

interface ExportOptions {
  includeMeasurements?: boolean;
  measurements?: Measurement[];
  format?: 'png' | 'jpeg';
  quality?: number;
  scale?: number;
}

interface FloorPlan {
  id: string;
  jobId: string;
  name: string;
  level: number;
  imageUrl: string;
  width: number;
  height: number;
  scale: number;
  annotations: any[];
  readings: any[];
}

export async function exportFloorPlan(
  container: HTMLElement,
  floorPlan: FloorPlan,
  jobId: string,
  options: ExportOptions = {}
): Promise<void> {
  const {
    includeMeasurements = true,
    measurements = [],
    format = 'png',
    quality = 1,
    scale = window.devicePixelRatio
  } = options;

  try {
    // Create a clone of the container to avoid modifying the original
    const clone = container.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    document.body.appendChild(clone);

    // Add measurement overlay if requested
    if (includeMeasurements && measurements.length > 0) {
      const overlay = document.createElement('div');
      overlay.className = 'absolute inset-0 pointer-events-none';
      overlay.style.zIndex = '50';

      const measurementList = measurements
        .map(m => {
          const value = m.value.toFixed(2);
          const unit = m.type === 'area' ? 'm²' : 'm';
          const label = m.label ? `${m.label}: ` : '';
          return `<div class="text-sm font-medium">${label}${value}${unit}</div>`;
        })
        .join('');

      overlay.innerHTML = `
        <div class="absolute bottom-4 right-4 bg-white bg-opacity-90 p-4 rounded shadow-lg">
          <div class="text-lg font-bold mb-2">Measurements</div>
          ${measurementList}
        </div>
      `;

      clone.appendChild(overlay);
    }

    // Capture the image using html2canvas
    const canvas = await html2canvas(clone, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    // Remove the clone from the document
    document.body.removeChild(clone);

    // Convert to blob and download
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
        },
        `image/${format}`,
        quality
      );
    });

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `floor-plan_${jobId}_level-${floorPlan.level}_${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error exporting floor plan:', error);
    throw new Error('Failed to export floor plan');
  }
}

export async function exportAllFloorPlans(
  container: HTMLElement,
  floorPlans: FloorPlan[],
  jobId: string,
  options: ExportOptions = {}
): Promise<void> {
  try {
    // Create a zip file containing all floor plans
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Export each floor plan
    for (const floorPlan of floorPlans) {
      const canvas = await html2canvas(container, {
        scale: options.scale || window.devicePixelRatio,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
          },
          `image/${options.format || 'png'}`,
          options.quality || 1
        );
      });

      // Add to zip
      zip.file(
        `floor-plan_level-${floorPlan.level}.${options.format || 'png'}`,
        blob
      );
    }

    // Generate and download zip file
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `floor-plans_${jobId}_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error exporting floor plans:', error);
    throw new Error('Failed to export floor plans');
  }
}
