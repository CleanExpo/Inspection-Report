import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

interface ReleaseConfig {
  version: string;
  previousVersion: string;
  releaseType: 'major' | 'minor' | 'patch';
}

interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: string;
}

class ReleasePreparation {
  private config: ReleaseConfig;
  private commits: CommitInfo[] = [];

  constructor(config: ReleaseConfig) {
    this.config = config;
  }

  async prepare(): Promise<void> {
    try {
      console.log('Starting release preparation...');

      // Collect git history
      await this.collectCommits();

      // Generate release notes
      await this.generateReleaseNotes();

      // Update version
      await this.updateVersion();

      // Create git tag
      await this.createGitTag();

      console.log('Release preparation completed successfully!');
    } catch (error) {
      console.error('Release preparation failed:', error);
      process.exit(1);
    }
  }

  private async collectCommits(): Promise<void> {
    console.log('Collecting commit history...');
    
    const { stdout } = await execAsync(
      `git log ${this.config.previousVersion}..HEAD --pretty=format:"%H|%s|%an|%ad"`
    );

    this.commits = stdout.split('\n').map(line => {
      const [hash, message, author, date] = line.split('|');
      return { hash, message, author, date };
    });

    console.log(`Collected ${this.commits.length} commits`);
  }

  private async generateReleaseNotes(): Promise<void> {
    console.log('Generating release notes...');

    const categories = {
      features: this.commits.filter(c => c.message.startsWith('feat:')),
      fixes: this.commits.filter(c => c.message.startsWith('fix:')),
      performance: this.commits.filter(c => c.message.startsWith('perf:')),
      other: this.commits.filter(c => 
        !c.message.startsWith('feat:') &&
        !c.message.startsWith('fix:') &&
        !c.message.startsWith('perf:')
      )
    };

    const notes = [
      `# Release Notes - v${this.config.version}`,
      '',
      `## Release Information`,
      `- Version: ${this.config.version}`,
      `- Release Date: ${new Date().toISOString().split('T')[0]}`,
      `- Previous Version: ${this.config.previousVersion}`,
      '',
      '## Changes',
      '',
      '### New Features',
      ...categories.features.map(c => `- ${c.message.replace('feat: ', '')}`),
      '',
      '### Bug Fixes',
      ...categories.fixes.map(c => `- ${c.message.replace('fix: ', '')}`),
      '',
      '### Performance Improvements',
      ...categories.performance.map(c => `- ${c.message.replace('perf: ', '')}`),
      '',
      '### Other Changes',
      ...categories.other.map(c => `- ${c.message}`),
      '',
      '## Upgrade Instructions',
      '',
      '1. Update your package.json:',
      '```json',
      `"@monitoring/system": "^${this.config.version}"`,
      '```',
      '',
      '2. Install the new version:',
      '```bash',
      'npm install',
      '```',
      '',
      '3. Run database migrations:',
      '```bash',
      'npm run migrate',
      '```',
      '',
      '4. Update your configuration:',
      '```bash',
      'cp .env.example .env',
      'nano .env  # Update with your settings',
      '```',
      '',
      '## Breaking Changes',
      '',
      'None.',
      '',
      '## Known Issues',
      '',
      'None.',
      '',
      '## Contributors',
      '',
      ...Array.from(new Set(this.commits.map(c => c.author))).map(author => `- ${author}`),
      '',
      '## Additional Notes',
      '',
      '- Please review the updated documentation for any new features or changes.',
      '- Run the test suite after upgrading to ensure compatibility.',
      '- Report any issues on the GitHub issue tracker.',
      ''
    ].join('\n');

    await fs.writeFile(
      path.join(process.cwd(), 'RELEASE_NOTES.md'),
      notes
    );

    console.log('Release notes generated');
  }

  private async updateVersion(): Promise<void> {
    console.log('Updating version...');

    // Update package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(
      await fs.readFile(packageJsonPath, 'utf-8')
    );

    packageJson.version = this.config.version;

    await fs.writeFile(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2)
    );

    // Commit version update
    await execAsync('git add package.json');
    await execAsync(`git commit -m "chore: bump version to ${this.config.version}"`);

    console.log('Version updated');
  }

  private async createGitTag(): Promise<void> {
    console.log('Creating git tag...');

    await execAsync(`git tag -a v${this.config.version} -m "Release ${this.config.version}"`);
    await execAsync('git push --tags');

    console.log('Git tag created and pushed');
  }
}

// Run if executed directly
if (require.main === module) {
  const config: ReleaseConfig = {
    version: process.env.NEW_VERSION || '1.0.0',
    previousVersion: process.env.PREV_VERSION || 'HEAD~50',
    releaseType: (process.env.RELEASE_TYPE || 'minor') as 'major' | 'minor' | 'patch'
  };

  const preparation = new ReleasePreparation(config);
  preparation.prepare();
}

export { ReleasePreparation };
export type { ReleaseConfig };
