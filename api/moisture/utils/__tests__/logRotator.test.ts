import fs from 'fs';
import path from 'path';
import { LogRotator } from '../logRotator';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  statSync: jest.fn(),
  readdirSync: jest.fn(),
  unlinkSync: jest.fn(),
  renameSync: jest.fn()
}));

describe('LogRotator', () => {
  const mockDate = new Date('2024-01-01T00:00:00Z');
  const logDir = 'logs';
  const baseFilename = 'test';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create log directory if it does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    
    new LogRotator(baseFilename);
    
    expect(fs.mkdirSync).toHaveBeenCalledWith(logDir, { recursive: true });
  });

  it('should not create log directory if it exists', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    
    new LogRotator(baseFilename);
    
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  it('should rotate log file when size limit is exceeded', () => {
    const rotator = new LogRotator(baseFilename);
    const currentLog = path.join(logDir, `${baseFilename}-2024-01-01.log`);
    
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.statSync as jest.Mock).mockReturnValue({ size: 11 * 1024 * 1024 }); // 11MB
    
    rotator.rotate();
    
    expect(fs.renameSync).toHaveBeenCalledWith(
      currentLog,
      expect.stringContaining(currentLog)
    );
  });

  it('should clean up old log files', () => {
    const rotator = new LogRotator(baseFilename);
    const oldFiles = Array(10).fill(null).map((_, i) => ({
      name: `${baseFilename}-2024-01-0${i}.log`,
      path: path.join(logDir, `${baseFilename}-2024-01-0${i}.log`),
      time: new Date(2024, 0, i).getTime()
    }));

    (fs.readdirSync as jest.Mock).mockReturnValue(oldFiles.map(f => f.name));
    (fs.statSync as jest.Mock).mockImplementation((filePath) => ({
      mtime: new Date(oldFiles.find(f => f.path === filePath)?.time || 0)
    }));

    rotator.rotate();

    // Should keep 7 most recent files and delete the rest
    expect(fs.unlinkSync).toHaveBeenCalledTimes(3);
    oldFiles.slice(7).forEach(file => {
      expect(fs.unlinkSync).toHaveBeenCalledWith(file.path);
    });
  });
});
