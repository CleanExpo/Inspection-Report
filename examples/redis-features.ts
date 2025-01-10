import { redis } from '../lib/redis';
import { realtime, RealtimeChannel } from '../lib/realtime';
import { queue, QueueName } from '../lib/queue';
import { withCache } from '../middleware/cache';
import { withSession } from '../middleware/session';
import { NextApiRequest, NextApiResponse } from 'next';

// Example API route using all Redis features
export default withSession(
    withCache(
        async function handler(req: NextApiRequest, res: NextApiResponse) {
            try {
                // 1. Session Management
                const { userId, role } = req.session || {};
                if (!userId) {
                    return res.status(401).json({ error: 'Unauthorized' });
                }

                // 2. Cache Example - Cache inspection data
                const inspectionId = req.query.id as string;
                const cacheKey = `inspection:${inspectionId}`;
                let inspectionData = await redis.getCacheItem(cacheKey);

                if (!inspectionData) {
                    // Simulate database fetch
                    inspectionData = {
                        id: inspectionId,
                        status: 'completed',
                        date: new Date().toISOString(),
                        findings: [
                            { area: 'Kitchen', issue: 'Water damage', severity: 'High' },
                            { area: 'Bathroom', issue: 'Mold growth', severity: 'Medium' }
                        ],
                        inspector: userId
                    };

                    // Cache the inspection data
                    await redis.setCacheItem(cacheKey, inspectionData, 3600); // 1 hour cache
                }

                // 3. Queue Background Jobs
                // Queue PDF report generation
                const reportJobId = await queue.addJob(
                    QueueName.REPORT_GENERATION,
                    'generate-pdf',
                    {
                        inspectionId,
                        format: 'pdf',
                        userId
                    }
                );

                // Queue email notification
                const emailJobId = await queue.addJob(
                    QueueName.EMAIL_NOTIFICATIONS,
                    'send-completion-email',
                    {
                        inspectionId,
                        userId,
                        type: 'inspection-complete'
                    }
                );

                // 4. Real-time Updates
                // Notify all connected clients about the inspection update
                await realtime.publish(
                    RealtimeChannel.INSPECTION_UPDATES,
                    'inspection:updated',
                    {
                        inspectionId,
                        status: 'report-generation-started',
                        reportJobId
                    }
                );

                // 5. Response with all relevant information
                res.json({
                    success: true,
                    inspection: inspectionData,
                    jobs: {
                        reportGeneration: reportJobId,
                        emailNotification: emailJobId
                    }
                });

            } catch (error) {
                console.error('API Error:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        },
        {
            duration: 3600, // Cache for 1 hour
            keyPrefix: 'api:inspections:'
        }
    ),
    {
        duration: 86400 // Session valid for 24 hours
    }
);

// Register queue processors
queue.registerProcessor(
    QueueName.REPORT_GENERATION,
    async (job) => {
        const { inspectionId, format, userId } = job.data;
        console.log(`Generating ${format} report for inspection ${inspectionId}`);
        
        // Simulate report generation
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Notify about completion via real-time channel
        await realtime.publish(
            RealtimeChannel.INSPECTION_UPDATES,
            'report:generated',
            {
                inspectionId,
                format,
                downloadUrl: `/api/reports/${inspectionId}.${format}`
            }
        );
    },
    { interval: 5000, concurrency: 2 }
);

queue.registerProcessor(
    QueueName.EMAIL_NOTIFICATIONS,
    async (job) => {
        const { inspectionId, userId, type } = job.data;
        console.log(`Sending ${type} email for inspection ${inspectionId} to user ${userId}`);
        
        // Simulate email sending
        await new Promise(resolve => setTimeout(resolve, 1000));
    },
    { interval: 3000, concurrency: 5 }
);

// Example React component using real-time updates
/*
import { useEffect, useState } from 'react';
import { realtime, RealtimeChannel } from '../lib/realtime';

function InspectionStatus({ inspectionId }: { inspectionId: string }) {
    const [status, setStatus] = useState<string>('loading');
    const [reportUrl, setReportUrl] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = realtime.subscribe(
            RealtimeChannel.INSPECTION_UPDATES,
            (message) => {
                if (message.data.inspectionId === inspectionId) {
                    switch (message.type) {
                        case 'inspection:updated':
                            setStatus(message.data.status);
                            break;
                        case 'report:generated':
                            setStatus('report-ready');
                            setReportUrl(message.data.downloadUrl);
                            break;
                    }
                }
            }
        );

        return () => unsubscribe();
    }, [inspectionId]);

    return (
        <div>
            <h3>Inspection Status: {status}</h3>
            {reportUrl && (
                <a href={reportUrl} target="_blank" rel="noopener noreferrer">
                    Download Report
                </a>
            )}
        </div>
    );
}
*/
