import { NextApiRequest, NextApiResponse } from 'next';
import { GitHubSync } from '../../../utils/github/GitHubSync';

const githubSync = new GitHubSync({
  owner: process.env.GITHUB_OWNER!,
  repo: process.env.GITHUB_REPO!,
  branch: process.env.GITHUB_BRANCH || 'main',
  token: process.env.GITHUB_TOKEN!,
  webhookSecret: process.env.GITHUB_WEBHOOK_SECRET!,
});

export const config = {
  api: {
    bodyParser: {
      raw: {
        type: 'application/json',
      },
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const signature = req.headers['x-hub-signature-256'];
  if (!signature || typeof signature !== 'string') {
    return res.status(401).json({ message: 'No signature' });
  }

  const rawBody = JSON.stringify(req.body);
  const isValid = await githubSync.verifyWebhookSignature(
    rawBody,
    signature
  );

  if (!isValid) {
    return res.status(401).json({ message: 'Invalid signature' });
  }

  const event = req.headers['x-github-event'];
  const payload = req.body;

  try {
    switch (event) {
      case 'push':
        // Handle push events (content updates)
        if (payload.ref === `refs/heads/${process.env.GITHUB_BRANCH}`) {
          const modifiedFiles = payload.commits.flatMap(
            (commit: any) => commit.modified
          );
          
          // Sync modified files
          const syncPromises = modifiedFiles.map((file: string) =>
            githubSync.syncContent(file)
          );
          
          await Promise.all(syncPromises);
          
          return res.status(200).json({
            message: 'Content synchronized',
            files: modifiedFiles,
          });
        }
        break;

      case 'pull_request':
        // Handle PR events (preview deployments)
        if (['opened', 'synchronize'].includes(payload.action)) {
          // Trigger preview deployment
          // This would typically call your deployment service
          // For example, Vercel or Netlify
          const previewUrl = await triggerPreviewDeployment(
            payload.pull_request.head.ref,
            payload.pull_request.head.sha
          );
          
          return res.status(200).json({
            message: 'Preview deployment triggered',
            url: previewUrl,
          });
        }
        break;

      default:
        return res.status(400).json({
          message: `Unhandled event type: ${event}`,
        });
    }

    return res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function triggerPreviewDeployment(
  branch: string,
  commit: string
): Promise<string> {
  // This function would integrate with your deployment service
  // For example, using Vercel's API:
  
  try {
    const response = await fetch(
      `https://api.vercel.com/v1/integrations/deploy/prj_YOUR_PROJECT_ID/DEPLOYMENT_HOOK`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        },
        body: JSON.stringify({
          target: 'preview',
          gitSource: {
            type: 'github',
            ref: branch,
            sha: commit,
          },
        }),
      }
    );

    const data = await response.json();
    return `https://${data.url}`; // Return preview URL
  } catch (error) {
    console.error('Preview deployment error:', error);
    throw new Error('Failed to trigger preview deployment');
  }
}
