import * as fs from '@nativescript/core/file-system';
export class Path {
  readonly base: 'documents' | 'app' | 'tmp';
  readonly relativePath?: string;
  readonly basePath: string;
  constructor(base: 'documents' | 'app' | 'tmp', relativePath?: string) {
    switch (base) {
      case 'documents':
        this.base = 'documents';
        this.basePath = fs.knownFolders.documents().path;
        break;
      case 'app':
        this.base = 'app';
        this.basePath = fs.knownFolders.currentApp().path;
        break;
      default:
        this.base = 'tmp';
        this.basePath = fs.knownFolders.temp().path;
        break;
    }

    this.relativePath = relativePath;
  }

  static fromPath(path: Path, relativePath: string = ''): Path {
    if (relativePath.startsWith('/')) {
      relativePath = relativePath.slice(1, relativePath.length);
    }
    if (path.relativePath.charAt(path.relativePath.length - 1) !== '/') {
      relativePath = `/${relativePath}`;
    }
    return new Path(path.base, `${path.relativePath}${relativePath}`);
  }

  get path() {
    return fs.path.join(
      this.basePath,
      this.relativePath ? this.relativePath : ''
    );
  }

  get folder() {
    return fs.Folder.fromPath(this.path);
  }

  get file() {
    return fs.File.fromPath(this.path);
  }

  createDirs() {
    this.folder;
  }
}
