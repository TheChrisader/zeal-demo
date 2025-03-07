import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import ts from "typescript";
import { createMatchPath, loadConfig } from "tsconfig-paths";

interface BundlerOptions {
  tsconfigPath?: string;
  outputExtension?: string;
  logLevel?: "silent" | "error" | "warn" | "info";
}

interface ProcessedFile {
  path: string;
  content: string;
}

class TsBundler {
  private visited = new Set<string>();
  private stack: string[] = [];
  private fileContents: ProcessedFile[] = [];
  private matchPath: (name: string) => string | undefined;
  private baseUrl: string;
  private logLevel: "silent" | "error" | "warn" | "info";

  constructor(options: BundlerOptions = {}) {
    this.logLevel = options.logLevel || "info";
    const tsconfig = loadConfig(options.tsconfigPath || process.cwd());

    if (tsconfig.resultType === "failed") {
      throw new Error(`Failed to load tsconfig: ${tsconfig.message}`);
    }

    this.baseUrl = tsconfig.absoluteBaseUrl;
    this.matchPath = createMatchPath(this.baseUrl, tsconfig.paths || {});
  }

  public async bundle(entryPath: string): Promise<string> {
    const absoluteEntry = path.resolve(entryPath);
    await this.processFile(absoluteEntry);
    return this.generateOutput();
  }

  private async processFile(filePath: string): Promise<void> {
    if (this.visited.has(filePath)) {
      if (this.stack.includes(filePath)) {
        this.log(
          `Detected circular import: ${this.stack.join(" -> ")} -> ${filePath}`,
          "warn",
        );
      }
      return;
    }

    this.visited.add(filePath);
    this.stack.push(filePath);

    try {
      const content = await fs.readFile(filePath, "utf-8");
      this.fileContents.push({ path: filePath, content });

      const imports = this.parseImports(filePath, content);
      for (const importSpecifier of imports) {
        const resolvedPath = this.resolveImport(importSpecifier, filePath);
        if (resolvedPath) {
          await this.processFile(resolvedPath);
        }
      }
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error}`);
    } finally {
      this.stack.pop();
    }
  }

  private parseImports(filePath: string, content: string): string[] {
    const imports = new Set<string>();
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
    );

    const visit = (node: ts.Node) => {
      if (ts.isImportDeclaration(node)) {
        const specifier = node.moduleSpecifier;
        if (ts.isStringLiteral(specifier)) {
          imports.add(specifier.text);
        }
      } else if (ts.isExportDeclaration(node)) {
        if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          imports.add(node.moduleSpecifier.text);
        }
      } else if (
        ts.isCallExpression(node) &&
        node.expression.getText(sourceFile) === "require" &&
        node.arguments.length > 0 &&
        node.arguments[0]
      ) {
        const arg = node.arguments[0];
        if (ts.isStringLiteral(arg)) {
          imports.add(arg.text);
        }
      }

      ts.forEachChild(node, visit);
    };

    ts.forEachChild(sourceFile, visit);
    return Array.from(imports);
  }

  private resolveImport(
    specifier: string,
    importingFile: string,
  ): string | null {
    if (specifier.startsWith(".")) {
      return this.resolveRelativeImport(specifier, importingFile);
    }
    return this.resolveAbsoluteImport(specifier);
  }

  private resolveRelativeImport(
    specifier: string,
    importingFile: string,
  ): string | null {
    const baseDir = path.dirname(importingFile);
    const resolvedPath = this.tryExtensions(path.resolve(baseDir, specifier));

    if (resolvedPath && !this.isInNodeModules(resolvedPath)) {
      return resolvedPath;
    }
    return null;
  }

  private resolveAbsoluteImport(specifier: string): string | null {
    const matchedPath = this.matchPath(specifier);
    if (matchedPath) {
      const resolvedPath = this.tryExtensions(matchedPath);
      if (resolvedPath && !this.isInNodeModules(resolvedPath)) {
        return resolvedPath;
      }
    }
    return null;
  }

  private tryExtensions(resolvedPath: string): string | null {
    const extensions = [
      { suffix: ".ts", isIndex: false },
      { suffix: ".tsx", isIndex: false },
      { suffix: "/index.ts", isIndex: true },
      { suffix: "/index.tsx", isIndex: true },
    ];

    // First check exact file matches
    try {
      const stats = fsSync.statSync(resolvedPath);
      if (stats.isFile()) {
        return resolvedPath;
      }
      if (stats.isDirectory()) {
        return this.findIndexFile(resolvedPath);
      }
    } catch {
      // Continue to extension checking
    }

    // Then check extensions
    for (const { suffix, isIndex } of extensions) {
      const testPath = resolvedPath + suffix;
      try {
        const stats = fsSync.statSync(testPath);
        if (stats.isFile()) {
          return testPath;
        }
        if (!isIndex && stats.isDirectory()) {
          const indexPath = this.findIndexFile(testPath);
          if (indexPath) return indexPath;
        }
      } catch {
        // Ignore and continue
      }
    }

    return null;
  }

  private findIndexFile(directoryPath: string): string | null {
    const indexExtensions = ["/index.ts", "/index.tsx"];

    for (const ext of indexExtensions) {
      const testPath = path.join(directoryPath, ext);
      try {
        if (fsSync.statSync(testPath).isFile()) {
          return testPath;
        }
      } catch {
        // Continue checking other extensions
      }
    }
    return null;
  }

  private isInNodeModules(filePath: string): boolean {
    return filePath.includes("node_modules");
  }

  private generateOutput(): string {
    return this.fileContents
      .map(({ path: filePath, content }) => {
        return `// ---- FILE: ${filePath} ----\n${content}\n// ---- END: ${filePath} ----\n\n`;
      })
      .join("\n");
  }

  private log(
    message: string,
    level: "silent" | "error" | "warn" | "info" = "info",
  ) {
    if (this.logLevel === "silent") return;
    if (level === "error") {
      console.error(message);
    } else if (level === "warn" && ["warn", "info"].includes(this.logLevel)) {
      console.warn(message);
    } else if (level === "info" && this.logLevel === "info") {
      console.log(message);
    }
  }
}

export async function bundle(
  entryPath: string,
  options: BundlerOptions = {},
): Promise<string> {
  const bundler = new TsBundler(options);
  return bundler.bundle(entryPath);
}

bundle("app/[locale]/(app)/(home)/page.tsx", {
  tsconfigPath: "tsconfig.json",
  logLevel: "info",
})
  .then((content) =>
    fsSync.writeFileSync("lib/text-bundler/bundle.txt", content),
  )
  .catch(console.error);
