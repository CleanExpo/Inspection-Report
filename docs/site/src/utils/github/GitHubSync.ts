import { Octokit } from '@octokit/rest';

interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  webhookSecret: string;
}

export class GitHubSync {
  private octokit: Octokit;
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = config;
    this.octokit = new Octokit({
      auth: config.token,
    });
  }

  async setupWebhook() {
    try {
      await this.octokit.repos.createWebhook({
        owner: this.config.owner,
        repo: this.config.repo,
        config: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/api/github/webhook`,
          content_type: 'json',
          secret: this.config.webhookSecret,
        },
        events: ['push', 'pull_request'],
      });
      return true;
    } catch (error) {
      console.error('Failed to setup webhook:', error);
      return false;
    }
  }

  async syncContent(path: string) {
    try {
      // Get file content from GitHub
      const { data } = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        ref: this.config.branch,
      });

      if ('content' in data) {
        // Decode content from base64
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return {
          content,
          sha: data.sha,
          success: true,
        };
      }
      throw new Error('Not a file');
    } catch (error) {
      console.error(`Failed to sync content for ${path}:`, error);
      return {
        content: null,
        sha: null,
        success: false,
      };
    }
  }

  async createPullRequest(title: string, body: string, changes: Array<{ path: string; content: string }>) {
    try {
      // Create a new branch for the PR
      const timestamp = Date.now();
      const newBranch = `docs-update-${timestamp}`;
      
      // Get the SHA of the current branch
      const { data: ref } = await this.octokit.git.getRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${this.config.branch}`,
      });

      // Create new branch
      await this.octokit.git.createRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `refs/heads/${newBranch}`,
        sha: ref.object.sha,
      });

      // Commit changes to new branch
      for (const change of changes) {
        const { data: currentFile } = await this.octokit.repos.getContent({
          owner: this.config.owner,
          repo: this.config.repo,
          path: change.path,
          ref: newBranch,
        });

        if ('sha' in currentFile) {
          await this.octokit.repos.createOrUpdateFileContents({
            owner: this.config.owner,
            repo: this.config.repo,
            path: change.path,
            message: `Update ${change.path}`,
            content: Buffer.from(change.content).toString('base64'),
            sha: currentFile.sha,
            branch: newBranch,
          });
        }
      }

      // Create PR
      const { data: pr } = await this.octokit.pulls.create({
        owner: this.config.owner,
        repo: this.config.repo,
        title,
        body,
        head: newBranch,
        base: this.config.branch,
      });

      return {
        number: pr.number,
        url: pr.html_url,
        success: true,
      };
    } catch (error) {
      console.error('Failed to create PR:', error);
      return {
        number: null,
        url: null,
        success: false,
      };
    }
  }

  async verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', this.config.webhookSecret);
    const digest = Buffer.from(
      'sha256=' + hmac.update(payload).digest('hex'),
      'utf8'
    );
    const checksum = Buffer.from(signature, 'utf8');
    return crypto.timingSafeEqual(digest, checksum);
  }
}
